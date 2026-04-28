package com.biblioo.user.infrastructure.auth;

import com.biblioo.user.domain.exception.EmailAlreadyExistsException;
import com.biblioo.user.domain.exception.InvalidCredentialsException;
import com.biblioo.user.domain.exception.InvalidTokenException;
import com.biblioo.user.domain.exception.UserNotFoundException;
import com.biblioo.user.domain.exception.UsernameAlreadyExistsException;
import com.biblioo.user.domain.model.AuthResult;
import com.biblioo.user.domain.model.GoogleUserInfo;
import com.biblioo.user.domain.model.RefreshToken;
import com.biblioo.user.domain.model.User;
import com.biblioo.user.domain.port.in.AuthUseCase;
import com.biblioo.user.domain.port.out.GoogleAuthPort;
import com.biblioo.user.infrastructure.async.TokenCleanupAdapter;
import com.biblioo.user.infrastructure.persistence.RefreshTokenRepository;
import com.biblioo.user.infrastructure.persistence.UserRepository;
import com.biblioo.user.infrastructure.security.JwtService;
import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.UUID;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

public class AuthServiceImpl implements AuthUseCase {

  private final UserRepository userRepo;
  private final RefreshTokenRepository tokenRepo;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;
  private final TokenCleanupAdapter tokenCleanup;
  private final int refreshTokenExpirationDays;
  private final GoogleAuthPort googleAuthPort;
  private final GoogleUserFactory googleUserFactory;

  public AuthServiceImpl(
      UserRepository userRepo,
      RefreshTokenRepository tokenRepo,
      PasswordEncoder passwordEncoder,
      JwtService jwtService,
      TokenCleanupAdapter tokenCleanup,
      int refreshTokenExpirationDays,
      GoogleAuthPort googleAuthPort,
      GoogleUserFactory googleUserFactory) {
    this.userRepo = userRepo;
    this.tokenRepo = tokenRepo;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
    this.tokenCleanup = tokenCleanup;
    this.refreshTokenExpirationDays = refreshTokenExpirationDays;
    this.googleAuthPort = googleAuthPort;
    this.googleUserFactory = googleUserFactory;
  }

  @Override
  public AuthResult register(String username, String email, String rawPassword) {
    if (userRepo.existsByEmail(email)) throw new EmailAlreadyExistsException(email);
    if (userRepo.existsByUsername(username)) throw new UsernameAlreadyExistsException(username);

    User user = new User();
    user.setUsername(username);
    user.setEmail(email);
    user.setPasswordHash(passwordEncoder.encode(rawPassword));
    user = userRepo.save(user);

    return buildAuthResult(user);
  }

  @Override
  public AuthResult login(String email, String rawPassword) {
    User user = userRepo.findByEmail(email).orElseThrow(InvalidCredentialsException::new);

    if (!passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
      throw new InvalidCredentialsException();
    }

    AuthResult result = buildAuthResult(user);
    tokenCleanup.scheduleCleanup(user.getId());
    return result;
  }

  @Override
  public AuthResult refresh(String refreshToken) {
    RefreshToken token =
        tokenRepo.findByToken(refreshToken).orElseThrow(InvalidTokenException::new);

    if (!token.isValid()) throw new InvalidTokenException();

    token.setUsed(true);
    tokenRepo.save(token);

    User user =
        userRepo
            .findById(token.getUserId())
            .orElseThrow(() -> new UserNotFoundException(token.getUserId()));

    return buildAuthResult(user);
  }

  @Override
  public void logout(String refreshToken) {
    tokenRepo
        .findByToken(refreshToken)
        .ifPresent(
            token -> {
              token.setUsed(true);
              tokenRepo.save(token);
            });
  }

  @Override
  @Transactional
  public AuthResult loginWithGoogle(String idToken) {
    GoogleUserInfo googleUser = googleAuthPort.verify(idToken);

    User user =
        userRepo.findByGoogleId(googleUser.googleId()).orElseGet(() -> createOrLink(googleUser));

    AuthResult result = buildAuthResult(user);
    tokenCleanup.scheduleCleanup(user.getId());
    return result;
  }

  /**
   * Tenta criar/vincular o usuário Google. Em caso de colisão de username por race condition,
   * descarta a transação interna (REQUIRES_NEW em GoogleUserFactory), verifica se outro thread já
   * criou o usuário e, se não, reexecuta com username de fallback baseado em UUID.
   */
  private User createOrLink(GoogleUserInfo googleUser) {
    try {
      return googleUserFactory.findOrCreate(googleUser, generateUniqueUsername(googleUser.name()));
    } catch (DataIntegrityViolationException e) {
      return userRepo
          .findByGoogleId(googleUser.googleId())
          .orElseGet(
              () -> {
                String fallback =
                    normalizeBase(googleUser.name())
                        + "_"
                        + UUID.randomUUID().toString().substring(0, 8);
                return googleUserFactory.findOrCreate(googleUser, fallback);
              });
    }
  }

  private String generateUniqueUsername(String displayName) {
    String base = normalizeBase(displayName);
    if (!userRepo.existsByUsername(base)) return base;

    for (int i = 1; i <= 10; i++) {
      String candidate = base + "_" + i;
      if (!userRepo.existsByUsername(candidate)) return candidate;
    }

    return base + "_" + UUID.randomUUID().toString().substring(0, 8);
  }

  private String normalizeBase(String displayName) {
    String base = displayName != null ? displayName : "user";
    String normalized =
        Normalizer.normalize(base, Normalizer.Form.NFD)
            .replaceAll("\\p{InCombiningDiacriticalMarks}", "")
            .toLowerCase()
            .replaceAll("\\s+", "_")
            .replaceAll("[^a-z0-9_]", "")
            .replaceAll("_+", "_")
            .replaceAll("^_|_$", "");

    if (normalized.isEmpty()) normalized = "user";
    return normalized.length() > 26 ? normalized.substring(0, 26) : normalized;
  }

  private AuthResult buildAuthResult(User user) {
    String accessToken =
        jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getUsername());
    String rawRefresh = jwtService.generateRefreshToken();

    RefreshToken refreshToken = new RefreshToken();
    refreshToken.setToken(rawRefresh);
    refreshToken.setUserId(user.getId());
    refreshToken.setExpiresAt(LocalDateTime.now().plusDays(refreshTokenExpirationDays));
    tokenRepo.save(refreshToken);

    return new AuthResult(accessToken, rawRefresh, user);
  }
}
