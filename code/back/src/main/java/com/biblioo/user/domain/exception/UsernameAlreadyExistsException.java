package com.biblioo.user.domain.exception;

public class UsernameAlreadyExistsException extends RuntimeException {
  public UsernameAlreadyExistsException(String username) {
    super("Nome de usuário já está em uso: " + username);
  }
}
