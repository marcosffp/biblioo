package com.biblioo.user.domain.exception;

public class EmailAlreadyExistsException extends RuntimeException {
  public EmailAlreadyExistsException(String email) {
    super("Email already in use: " + email);
  }
}
