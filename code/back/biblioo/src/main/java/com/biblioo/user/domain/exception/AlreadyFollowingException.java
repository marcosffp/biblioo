package com.biblioo.user.domain.exception;

public class AlreadyFollowingException extends RuntimeException {
  public AlreadyFollowingException() {
    super("You are already following this user");
  }
}
