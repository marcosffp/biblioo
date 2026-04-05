package com.biblioo.recommendation.infrastructure.consumer;

import com.biblioo.infrastructure.messaging.config.RabbitMQConfig;
import com.biblioo.infrastructure.messaging.model.EventMessage;
import com.biblioo.recommendation.domain.exception.DuplicateEventException;
import com.biblioo.recommendation.domain.service.BecauseYouReadService;
import com.biblioo.recommendation.infrastructure.persistence.EventLogRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class RecommendationConsumer {

  private final BecauseYouReadService becauseYouReadService;
  private final EventLogRepository eventLogRepository;
  private final ObjectMapper objectMapper;

  @RabbitListener(queues = RabbitMQConfig.REC_QUEUE, containerFactory = "recListenerFactory")
  public void handle(EventMessage message) {
    String eventId = message.getEventId();

    MDC.put("event_id", eventId);
    MDC.put("trail", "BECAUSE_YOU_READ");

    try {
      if (eventLogRepository.existsByEventId(eventId)) {
        log.info("[T1-Consumer] Evento duplicado event_id={}, descartando", eventId);
        return;
      }

      JsonNode payload = message.getPayload();
      Long bookId = Long.parseLong(message.getAggregateId());
      Long userId = payload.get("userId").asLong();
      Long shelfItemId = payload.get("shelfItemId").asLong();
      String finishedAt = payload.get("finishedAt").asText();

      log.info("[T1-Consumer] Processando event_id={} user={} book={}", eventId, userId, bookId);

      try {
        eventLogRepository.registerEvent(
            eventId, message.getEventType(), userId, objectMapper.writeValueAsString(payload));
      } catch (DuplicateEventException ex) {
        log.info("[T1-Consumer] Race condition em event_id={}, descartando", eventId);
        return;
      }

      becauseYouReadService.compute(userId, bookId, shelfItemId, finishedAt);

      log.info("[T1-Consumer] Concluído event_id={} user={} book={}", eventId, userId, bookId);

    } catch (Exception ex) {
      log.error("[T1-Consumer] Falha ao processar event_id={}: {}", eventId, ex.getMessage(), ex);
      throw new RuntimeException(ex);
    } finally {
      MDC.clear();
    }
  }
}
