package com.biblioo.infrastructure.messaging.adapter;

import com.biblioo.books.domain.port.out.ShelfEventPublisherPort;
import com.biblioo.infrastructure.messaging.config.RabbitMQConfig;
import com.biblioo.infrastructure.messaging.service.OutboxEventService;
import java.util.Map;
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

  @Override
  public void publishReadingCompleted(
      Long userId, Long bookId, Long shelfItemId, Long shelfId, String finishedAt) {
    Map<String, Object> payload =
        Map.of(
            "userId", userId,
            "shelfId", shelfId,
            "shelfItemId", shelfItemId,
            "finishedAt", finishedAt);
    outboxEventService.saveAndSchedulePublish(
        RabbitMQConfig.EVENT_SHELF_READING_COMPLETED,
        "SHELF_ITEM",
        bookId.toString(),
        RabbitMQConfig.SHELF_READING_COMPLETED_ROUTING_KEY,
        payload);
  }
}
