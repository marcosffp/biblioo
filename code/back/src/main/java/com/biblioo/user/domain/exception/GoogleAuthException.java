package com.biblioo.user.domain.exception;

public class GoogleAuthException extends RuntimeException {
  public GoogleAuthException(String message) {
    super(message);
  }
}
