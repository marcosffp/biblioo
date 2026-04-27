package com.biblioo.feed.infrastructure.messaging;

import com.biblioo.feed.domain.port.out.ReviewFanoutPublisherPort;
import com.biblioo.infrastructure.messaging.config.RabbitMQConfig;
import com.biblioo.infrastructure.messaging.service.OutboxEventService;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class RabbitMQReviewFanoutAdapter implements ReviewFanoutPublisherPort {

  private final OutboxEventService outboxEventService;

  @Override
  public void publishReviewCreated(Long reviewId, Long authorId, long createdAtEpochMilli) {
    outboxEventService.saveAndSchedulePublish(
        RabbitMQConfig.EVENT_REVIEW_PUBLISHED,
        "Review",
        reviewId.toString(),
        RabbitMQConfig.FEED_FANOUT_ROUTING_KEY,
        Map.of(
            "contentId", reviewId,
            "contentType", "REVIEW",
            "authorId", authorId,
            "createdAtEpochMilli", createdAtEpochMilli));
  }
}
