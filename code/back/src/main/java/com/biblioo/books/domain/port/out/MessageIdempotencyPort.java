package com.biblioo.books.domain.port.out;

public interface MessageIdempotencyPort {
  boolean isAlreadyProcessed(String eventId);

  void markAsProcessed(String eventId);

  void markAsFailed(String eventId, String errorMessage);
}
