package com.biblioo.user.domain.exception;

public class InvalidTokenException extends RuntimeException {
  public InvalidTokenException() {
    super("Token de atualização inválido ou expirado");
  }
}
