package com.biblioo.recommendation.domain.exception;

public class InvalidPreferenceException extends RuntimeException {
  public InvalidPreferenceException(String message) {
    super(message);
  }
}
