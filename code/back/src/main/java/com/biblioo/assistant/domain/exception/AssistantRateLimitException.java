package com.biblioo.assistant.domain.exception;

public class AssistantRateLimitException extends RuntimeException {
  public AssistantRateLimitException(String message) {
    super(message);
  }
}
