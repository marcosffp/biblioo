package com.biblioo.infrastructure.messaging.adapter;

import com.biblioo.books.domain.port.out.ShelfEventPublisherPort;
import com.biblioo.infrastructure.messaging.config.RabbitMQConfig;
import com.biblioo.infrastructure.messaging.service.OutboxEventService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RabbitMQShelfEventAdapter implements ShelfEventPublisherPort {

  private final OutboxEventService outboxEventService;

  @Override
  public void publishReaderCountIncrement(Long bookId) {
    outboxEventService.saveAndSchedulePublish(
        RabbitMQConfig.EVENT_BOOK_SHELF_ADDED,
        "BOOK",
        bookId.toString(),
        RabbitMQConfig.BOOK_SHELF_ROUTING_KEY);
  }

  @Override
  public void publishReaderCountDecrement(Long bookId) {
    outboxEventService.saveAndSchedulePublish(
        RabbitMQConfig.EVENT_BOOK_SHELF_REMOVED,
        "BOOK",
        bookId.toString(),
        RabbitMQConfig.BOOK_SHELF_ROUTING_KEY);
  }

  @Override
  public void publishBookReviewStatsUpdated(Long bookId) {
    outboxEventService.saveAndSchedulePublish(
        RabbitMQConfig.EVENT_BOOK_REVIEW_STATS,
        "BOOK",
        bookId.toString(),
        RabbitMQConfig.BOOK_REVIEW_ROUTING_KEY);
  }
}
