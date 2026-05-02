package com.biblioo.user.domain.exception;

public class PasswordAlreadyExistsException extends RuntimeException {

  public PasswordAlreadyExistsException() {
    super("Esta conta já possui uma senha cadastrada.");
  }
}
