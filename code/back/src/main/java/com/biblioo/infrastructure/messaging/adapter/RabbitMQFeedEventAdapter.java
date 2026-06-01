package com.biblioo.infrastructure.messaging.adapter;

import com.biblioo.feed.domain.port.out.FeedEventPublisherPort;
import com.biblioo.infrastructure.messaging.config.RabbitMQConfig;
import com.biblioo.infrastructure.messaging.service.OutboxEventService;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RabbitMQFeedEventAdapter implements FeedEventPublisherPort {

  private final OutboxEventService outboxEventService;

  @Override
  public void publishBookReviewStatsUpdated(Long bookId, Integer oldRating, Integer newRating) {
    Map<String, Object> payload = new HashMap<>();
    payload.put("oldRating", oldRating);
    payload.put("newRating", newRating);

    outboxEventService.saveAndSchedulePublish(
        RabbitMQConfig.EVENT_BOOK_REVIEW_STATS,
        "BOOK",
        bookId.toString(),
        RabbitMQConfig.BOOK_REVIEW_ROUTING_KEY,
        payload);
  }

  @Override
  public void publishReviewRatingUpdated(Long userId, Long bookId) {
    Map<String, Object> payload = Map.of("userId", userId, "bookId", bookId);
    outboxEventService.saveAndSchedulePublish(
        RabbitMQConfig.EVENT_REVIEW_RATING_UPDATED,
        "REVIEW",
        userId.toString(),
        RabbitMQConfig.REVIEW_RATING_UPDATED_ROUTING_KEY,
        payload);
  }
}
