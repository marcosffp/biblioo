package com.biblioo.feed.infrastructure.messaging;

import com.biblioo.feed.domain.port.out.FeedPostFanoutPublisherPort;
import com.biblioo.infrastructure.messaging.config.RabbitMQConfig;
import com.biblioo.infrastructure.messaging.service.OutboxEventService;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RabbitMQFeedPostFanoutAdapter implements FeedPostFanoutPublisherPort {

  private final OutboxEventService outboxEventService;

  @Override
  public void publishPostCreated(Long postId, Long authorId, long createdAtEpochMilli) {
    outboxEventService.saveAndSchedulePublish(
        RabbitMQConfig.EVENT_POST_PUBLISHED,
        "FeedPost",
        postId.toString(),
        RabbitMQConfig.FEED_POST_ROUTING_KEY,
        Map.of(
            "contentId", postId,
            "contentType", "POST",
            "authorId", authorId,
            "createdAtEpochMilli", createdAtEpochMilli));
  }
}
