package com.biblioo.user.domain.exception;

public class AlreadyFollowingException extends RuntimeException {
  public AlreadyFollowingException() {
    super("Você já segue este usuário");
  }
}
