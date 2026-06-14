package com.biblioo.recommendation.infrastructure.consumer;

import com.biblioo.infrastructure.messaging.config.RabbitMQConfig;
import com.biblioo.infrastructure.messaging.model.EventMessage;
import com.biblioo.recommendation.domain.exception.DuplicateEventException;
import com.biblioo.recommendation.domain.service.TrendingInCommunitiesService;
import com.biblioo.recommendation.infrastructure.persistence.EventLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class TrendingInCommunitiesConsumer {

  private static final String TRAIL = "TRENDING_IN_COMMUNITIES";
  private static final String LOG_PREFIX = "[TIC-Consumer]";

  private final TrendingInCommunitiesService trendingInCommunitiesService;
  private final EventLogRepository eventLogRepository;

  @RabbitListener(
      queues = RabbitMQConfig.TIC_MESSAGE_QUEUE,
      containerFactory = "trendingInCommunitiesListenerFactory")
  public void handleMessage(EventMessage message) {
    handleEvent(message, "message", "TIC-MSG:");
  }

  @RabbitListener(
      queues = RabbitMQConfig.TIC_JOIN_QUEUE,
      containerFactory = "trendingInCommunitiesListenerFactory")
  public void handleJoin(EventMessage message) {
    handleEvent(message, "join", "TIC-JOIN:");
  }

  private void handleEvent(EventMessage message, String eventType, String logKeyPrefix) {
    String eventId = message.getEventId();
    String logKey = logKeyPrefix + eventId;

    MDC.put("event_id", eventId);
    MDC.put("trail", TRAIL);
    try {
      if (eventLogRepository.existsByEventId(logKey)) {
        return;
      }

      Long userId = message.getPayload().get("userId").asLong();
      Long bookId = message.getPayload().get("bookId").asLong();

      try {
        eventLogRepository.registerEvent(logKey, TRAIL, userId, message.getPayload().toString());
      } catch (DuplicateEventException ex) {
        log.warn("{} Race condition em event_id={}, descartando", LOG_PREFIX, eventId);
        return;
      }

      trendingInCommunitiesService.compute(userId, bookId, eventType);

    } catch (Exception ex) {
      log.error(
          "{} Falha ao processar event_id={} eventType={}: {}",
          LOG_PREFIX,
          eventId,
          eventType,
          ex.getMessage(),
          ex);
      throw new RuntimeException(ex);
    } finally {
      MDC.clear();
    }
  }
}
