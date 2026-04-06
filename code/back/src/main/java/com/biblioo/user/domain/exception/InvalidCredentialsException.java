package com.biblioo.user.domain.exception;

public class InvalidCredentialsException extends RuntimeException {
  public InvalidCredentialsException() {
    super("Invalid email or password");
  }
}
