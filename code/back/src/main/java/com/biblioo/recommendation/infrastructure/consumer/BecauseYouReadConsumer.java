package com.biblioo.recommendation.infrastructure.consumer;

import com.biblioo.books.domain.port.in.BookUseCase;
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
public class BecauseYouReadConsumer {

  private static final String TRAIL = "BECAUSE_YOU_READ";
  private static final String LOG_PREFIX = "[BYR-Consumer]";

  private final BecauseYouReadService becauseYouReadService;
  private final EventLogRepository eventLogRepository;
  private final ObjectMapper objectMapper;
  private final BookUseCase bookUseCase;

  @RabbitListener(
      queues = RabbitMQConfig.BYR_QUEUE,
      containerFactory = "becauseYouReadListenerFactory")
  public void handle(EventMessage message) {
    String eventId = message.getEventId();

    MDC.put("event_id", eventId);
    MDC.put("trail", TRAIL);

    try {
      if (eventLogRepository.existsByEventId(eventId)) {
        return;
      }

      JsonNode payload = message.getPayload();
      Long bookId = Long.parseLong(message.getAggregateId());
      Long userId = payload.get("userId").asLong();
      Long shelfItemId = payload.get("shelfItemId").asLong();
      String finishedAt = payload.get("finishedAt").asText();
      String seedBookTitle = resolveSeedBookTitle(bookId);

      try {
        eventLogRepository.registerEvent(
            eventId, message.getEventType(), userId, objectMapper.writeValueAsString(payload));
      } catch (DuplicateEventException ex) {
        log.warn("{} Race condition em event_id={}, descartando", LOG_PREFIX, eventId);
        return;
      }

      becauseYouReadService.compute(userId, bookId, shelfItemId, finishedAt, seedBookTitle);

    } catch (Exception ex) {
      log.error("{} Falha ao processar event_id={}: {}", LOG_PREFIX, eventId, ex.getMessage(), ex);
      throw new RuntimeException(ex);
    } finally {
      MDC.clear();
    }
  }

  private String resolveSeedBookTitle(Long bookId) {
    try {
      return bookUseCase.getById(bookId).getTitle();
    } catch (Exception ex) {
      log.warn(
          "{} Não foi possível resolver título para bookId={}: {}",
          LOG_PREFIX,
          bookId,
          ex.getMessage());
      return null;
    }
  }
}
