package com.biblioo.feed.infrastructure.messaging;

import com.biblioo.feed.domain.service.FeedFanoutService;
import com.biblioo.infrastructure.messaging.config.RabbitMQConfig;
import com.biblioo.infrastructure.messaging.model.EventMessage;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class FeedFanoutConsumer {

  private static final String LOG_PREFIX = "[FeedFanout]";

  private final FeedFanoutService feedFanoutService;

  @RabbitListener(queues = RabbitMQConfig.FEED_FANOUT_QUEUE)
  public void handle(EventMessage message) {
    String eventId = message.getEventId();
    MDC.put("event_id", eventId);
    try {
      String eventType = message.getEventType();
      boolean isReview = RabbitMQConfig.EVENT_REVIEW_PUBLISHED.equals(eventType);
      boolean isPost = RabbitMQConfig.EVENT_POST_PUBLISHED.equals(eventType);

      if (!isReview && !isPost) {
        return;
      }

      JsonNode payload = message.getPayload();
      Long contentId = payload.get("contentId").asLong();
      String contentType = payload.get("contentType").asText();
      Long authorId = payload.get("authorId").asLong();
      long createdAtEpochMilli = payload.get("createdAtEpochMilli").asLong();

      feedFanoutService.processFanout(eventId, contentId, contentType, authorId, createdAtEpochMilli);

    } catch (Exception ex) {
      log.error("{} Falha ao processar event_id={}: {}", LOG_PREFIX, eventId, ex.getMessage(), ex);
      throw new RuntimeException(ex);
    } finally {
      MDC.clear();
    }
  }
}
