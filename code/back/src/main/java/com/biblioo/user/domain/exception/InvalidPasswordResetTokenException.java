package com.biblioo.user.domain.exception;

public class InvalidPasswordResetTokenException extends RuntimeException {

  public InvalidPasswordResetTokenException(String message) {
    super(message);
  }
}
