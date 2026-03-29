package com.biblioo.user.infrastructure.auth;

import com.biblioo.user.domain.exception.EmailAlreadyExistsException;
import com.biblioo.user.domain.exception.InvalidCredentialsException;
import com.biblioo.user.domain.exception.InvalidTokenException;
import com.biblioo.user.domain.exception.UserNotFoundException;
import com.biblioo.user.domain.exception.UsernameAlreadyExistsException;
import com.biblioo.user.domain.model.AuthResult;
import com.biblioo.user.domain.model.RefreshToken;
import com.biblioo.user.domain.model.User;
import com.biblioo.user.domain.port.in.AuthUseCase;
import com.biblioo.user.domain.port.out.RefreshTokenRepositoryPort;
import com.biblioo.user.domain.port.out.UserRepositoryPort;
import com.biblioo.user.infrastructure.async.TokenCleanupAdapter;
import com.biblioo.user.infrastructure.security.JwtService;
import java.time.LocalDateTime;
import org.springframework.security.crypto.password.PasswordEncoder;

public class AuthServiceImpl implements AuthUseCase {

  private final UserRepositoryPort userRepo;
  private final RefreshTokenRepositoryPort tokenRepo;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;
  private final TokenCleanupAdapter tokenCleanup;
  private final int refreshTokenExpirationDays;

  public AuthServiceImpl(
      UserRepositoryPort userRepo,
      RefreshTokenRepositoryPort tokenRepo,
      PasswordEncoder passwordEncoder,
      JwtService jwtService,
      TokenCleanupAdapter tokenCleanup,
      int refreshTokenExpirationDays) {
    this.userRepo = userRepo;
    this.tokenRepo = tokenRepo;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
    this.tokenCleanup = tokenCleanup;
    this.refreshTokenExpirationDays = refreshTokenExpirationDays;
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
