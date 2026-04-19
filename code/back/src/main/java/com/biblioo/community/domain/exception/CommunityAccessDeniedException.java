package com.biblioo.community.domain.exception;

public class CommunityAccessDeniedException extends RuntimeException {
  public CommunityAccessDeniedException(String message) {
    super(message);
  }
}
