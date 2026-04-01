package com.biblioo.infrastructure.messaging.adapter;

import com.biblioo.books.domain.port.out.MessageIdempotencyPort;
import com.biblioo.infrastructure.messaging.service.OutboxEventService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class MessageIdempotencyAdapter implements MessageIdempotencyPort {

  private final OutboxEventService outboxEventService;

  @Override
  public boolean isAlreadyProcessed(String eventId) {
    return outboxEventService.isAlreadyProcessed(eventId);
  }

  @Override
  public void markAsProcessed(String eventId) {
    outboxEventService.markAsProcessed(eventId);
  }

  @Override
  public void markAsFailed(String eventId, String errorMessage) {
    outboxEventService.markAsFailed(eventId, errorMessage);
  }
}
