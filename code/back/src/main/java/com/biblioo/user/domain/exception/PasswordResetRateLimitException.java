package com.biblioo.user.domain.exception;

public class PasswordResetRateLimitException extends RuntimeException {

  public PasswordResetRateLimitException() {
    super("Limite de solicitações atingido. Aguarde 1 hora antes de tentar novamente.");
  }
}
