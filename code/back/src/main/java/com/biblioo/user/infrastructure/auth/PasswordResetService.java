package com.biblioo.user.infrastructure.auth;

import com.biblioo.user.domain.exception.InvalidPasswordResetTokenException;
import com.biblioo.user.domain.exception.PasswordAlreadyExistsException;
import com.biblioo.user.domain.exception.PasswordResetRateLimitException;
import com.biblioo.user.domain.exception.UserNotFoundException;
import com.biblioo.user.domain.model.PasswordResetResponse;
import com.biblioo.user.domain.model.PasswordResetToken;
import com.biblioo.user.domain.model.User;
import com.biblioo.user.domain.port.in.PasswordResetUseCase;
import com.biblioo.user.domain.port.out.PasswordResetEmailPort;
import com.biblioo.user.infrastructure.persistence.PasswordResetTokenRepository;
import com.biblioo.user.infrastructure.persistence.RefreshTokenRepository;
import com.biblioo.user.infrastructure.persistence.UserRepository;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
public class PasswordResetService implements PasswordResetUseCase {

  private static final int MAX_REQUESTS_PER_HOUR = 3;
  private static final int TOKEN_EXPIRATION_MINUTES = 30;

  private final UserRepository userRepo;
  private final RefreshTokenRepository refreshTokenRepo;
  private final PasswordResetTokenRepository resetTokenRepo;
  private final PasswordEncoder passwordEncoder;
  private final PasswordResetEmailPort emailPort;
  private final String frontendUrl;
  private final String passwordResetPath;
  private final String mobileDeepLinkUrl;
  private final String mobileResetPath;

  public PasswordResetService(
      UserRepository userRepo,
      RefreshTokenRepository refreshTokenRepo,
      PasswordResetTokenRepository resetTokenRepo,
      PasswordEncoder passwordEncoder,
      PasswordResetEmailPort emailPort,
      String frontendUrl,
      String passwordResetPath,
      String mobileDeepLinkUrl,
      String mobileResetPath) {
    this.userRepo = userRepo;
    this.refreshTokenRepo = refreshTokenRepo;
    this.resetTokenRepo = resetTokenRepo;
    this.passwordEncoder = passwordEncoder;
    this.emailPort = emailPort;
    this.frontendUrl = frontendUrl;
    this.passwordResetPath = passwordResetPath;
    this.mobileDeepLinkUrl = mobileDeepLinkUrl;
    this.mobileResetPath = mobileResetPath;
  }

@Override
@Transactional
public PasswordResetResponse requestPasswordReset(String email, String clientType) {
  log.info("[PasswordReset] Iniciando solicitação email={} clientType={}", email, clientType);

  Optional<User> userOpt = userRepo.findByEmail(email);

  if (userOpt.isEmpty()) {
    log.warn("[PasswordReset] E-mail não encontrado email={} — retornando resposta genérica", email);
    return new PasswordResetResponse(
        "Se o e-mail estiver cadastrado, você receberá um link em breve.");
  }

  User user = userOpt.get();
  log.info("[PasswordReset] Usuário encontrado userId={} googleId={}", user.getId(), user.getGoogleId());

  LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
  long recentCount = resetTokenRepo.countRecentRequests(user.getId(), oneHourAgo);
  log.info("[PasswordReset] Solicitações recentes userId={} count={} max={}", user.getId(), recentCount, MAX_REQUESTS_PER_HOUR);
  if (recentCount >= MAX_REQUESTS_PER_HOUR) {
    log.warn("[PasswordReset] Rate limit atingido userId={}", user.getId());
    throw new PasswordResetRateLimitException();
  }

  String rawToken = UUID.randomUUID().toString().replace("-", "");
  PasswordResetToken resetToken = new PasswordResetToken();
  resetToken.setToken(rawToken);
  resetToken.setUserId(user.getId());
  resetToken.setExpiresAt(LocalDateTime.now().plusMinutes(TOKEN_EXPIRATION_MINUTES));
  resetTokenRepo.save(resetToken);
  log.info("[PasswordReset] Token salvo userId={} expiresAt={}", user.getId(), resetToken.getExpiresAt());

  String resetLink = buildResetLink(clientType, rawToken);
  log.info("[PasswordReset] Enviando email userId={} clientType={} resetLink={}", user.getId(), clientType, resetLink);
  emailPort.sendPasswordResetEmail(user.getEmail(), user.getUsername(), resetLink);

  log.info("[PasswordReset] Solicitação concluída userId={}", user.getId());
  return new PasswordResetResponse(
      "Se o e-mail estiver cadastrado, você receberá um link em breve.");
}

private String buildResetLink(String clientType, String token) {
  if ("mobile".equalsIgnoreCase(clientType)) {
    return mobileDeepLinkUrl + mobileResetPath + "?token=" + token;
  }
  return frontendUrl + passwordResetPath + "?token=" + token;
}
  @Override
  @Transactional
  public void resetPassword(String token, String newPassword) {
    PasswordResetToken resetToken =
        resetTokenRepo
            .findByToken(token)
            .orElseThrow(
                () ->
                    new InvalidPasswordResetTokenException(
                        "Link inválido ou expirado. Solicite um novo link."));

    if (resetToken.isUsed()) {
      throw new InvalidPasswordResetTokenException(
          "Este link já foi utilizado. Solicite um novo link de redefinição.");
    }
    if (resetToken.isExpired()) {
      throw new InvalidPasswordResetTokenException(
          "Este link expirou. Solicite um novo link de redefinição.");
    }

    User user =
        userRepo
            .findById(resetToken.getUserId())
            .orElseThrow(() -> new UserNotFoundException(resetToken.getUserId()));

    // RN-12: salvar nova senha com hash, invalidar token, encerrar sessões
    user.setPasswordHash(passwordEncoder.encode(newPassword));
    userRepo.save(user);

    resetToken.setUsed(true);
    resetTokenRepo.save(resetToken);

    refreshTokenRepo.deleteAllByUserId(user.getId());

    // RN-13: confirmação por e-mail
    emailPort.sendPasswordChangedConfirmation(user.getEmail(), user.getUsername());

    log.info("Senha redefinida com sucesso userId={}", user.getId());
  }

  @Override
  @Transactional
  public void createPassword(Long userId, String newPassword) {
    User user =
        userRepo.findById(userId).orElseThrow(() -> new UserNotFoundException(userId));

    if (user.getPasswordHash() != null) {
      throw new PasswordAlreadyExistsException();
    }

    user.setPasswordHash(passwordEncoder.encode(newPassword));
    userRepo.save(user);

    log.info("Senha criada com sucesso userId={}", userId);
  }
}
