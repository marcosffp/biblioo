package com.biblioo.dna.infrastructure.messaging;

import com.biblioo.dna.domain.exception.DnaEventDuplicateException;
import com.biblioo.dna.domain.port.in.LiteraryDnaUseCase;
import com.biblioo.dna.infrastructure.persistence.DnaEventLogRepository;
import com.biblioo.infrastructure.messaging.config.RabbitMQConfig;
import com.biblioo.infrastructure.messaging.model.EventMessage;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DnaRecalculationConsumer {

  private static final String LOG_PREFIX = "[DNA-Consumer]";

  private final LiteraryDnaUseCase literaryDnaUseCase;
  private final DnaEventLogRepository eventLogRepository;
  private final ObjectMapper objectMapper;

  @RabbitListener(queues = RabbitMQConfig.DNA_RECALC_QUEUE)
  public void handle(EventMessage message) {
    String eventId = message.getEventId();
    MDC.put("event_id", eventId);
    try {
      if (eventLogRepository.existsByEventId(eventId)) {
        return;
      }

      Long userId = extractUserId(message);
      if (userId == null) {
        return;
      }

      try {
        eventLogRepository.registerEvent(
            eventId,
            message.getEventType(),
            userId,
            objectMapper.writeValueAsString(message.getPayload()));
      } catch (DnaEventDuplicateException ex) {
        return;
      }

      literaryDnaUseCase.triggerRecalculation(userId);

    } catch (Exception ex) {
      log.error("{} Falha event_id={}: {}", LOG_PREFIX, eventId, ex.getMessage(), ex);
      throw new RuntimeException(ex);
    } finally {
      MDC.clear();
    }
  }

  private Long extractUserId(EventMessage message) {
    try {
      if (message.getPayload() != null && message.getPayload().has("userId")) {
        return message.getPayload().get("userId").asLong();
      }
      return Long.parseLong(message.getAggregateId());
    } catch (Exception e) {
      log.warn("{} Não foi possível extrair userId do evento: {}", LOG_PREFIX, e.getMessage());
      return null;
    }
  }
}
