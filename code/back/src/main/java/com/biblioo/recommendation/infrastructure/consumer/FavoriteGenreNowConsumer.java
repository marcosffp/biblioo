package com.biblioo.recommendation.infrastructure.consumer;

import com.biblioo.infrastructure.messaging.config.RabbitMQConfig;
import com.biblioo.infrastructure.messaging.model.EventMessage;
import com.biblioo.recommendation.domain.exception.DuplicateEventException;
import com.biblioo.recommendation.domain.service.FavoriteGenreNowService;
import com.biblioo.recommendation.infrastructure.persistence.EventLogRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class FavoriteGenreNowConsumer {

  private static final String TRAIL = "FAVORITE_GENRE_NOW";
  private static final String LOG_PREFIX = "[FGN-Consumer]";

  private final FavoriteGenreNowService favoriteGenreNowService;
  private final EventLogRepository eventLogRepository;
  private final ObjectMapper objectMapper;

  @RabbitListener(
      queues = RabbitMQConfig.FGN_QUEUE,
      containerFactory = "favoriteGenreNowListenerFactory")
  public void handle(EventMessage message) {
    String eventId = message.getEventId();
    // Prefixo "FGN:" isola o log de idempotência deste consumer do T1 (RecommendationConsumer),
    // que registra o mesmo eventId sem prefixo para o mesmo routing key.
    String logKey = "FGN:" + eventId;

    MDC.put("event_id", eventId);
    MDC.put("trail", TRAIL);
    try {
      if (eventLogRepository.existsByEventId(logKey)) {
        return;
      }

      Long userId = message.getPayload().get("userId").asLong();

      try {
        eventLogRepository.registerEvent(
            logKey, TRAIL, userId, objectMapper.writeValueAsString(message.getPayload()));
      } catch (DuplicateEventException ex) {
        log.warn("{} Race condition em event_id={}, descartando", LOG_PREFIX, eventId);
        return;
      }

      favoriteGenreNowService.compute(userId);


    } catch (Exception ex) {
      log.error(
          "{} Falha ao processar event_id={}: {}", LOG_PREFIX, eventId, ex.getMessage(), ex);
      throw new RuntimeException(ex);
    } finally {
      MDC.clear();
    }
  }
}
