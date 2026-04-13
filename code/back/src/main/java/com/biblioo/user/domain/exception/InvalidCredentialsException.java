package com.biblioo.user.domain.exception;

public class InvalidCredentialsException extends RuntimeException {
  public InvalidCredentialsException() {
    super("Email ou senha inválidos");
  }
}
