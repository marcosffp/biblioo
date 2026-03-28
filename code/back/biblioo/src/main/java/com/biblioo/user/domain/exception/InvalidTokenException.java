package com.biblioo.user.domain.exception;

public class InvalidTokenException extends RuntimeException {
  public InvalidTokenException() {
    super("Refresh token is invalid or expired");
  }
}
