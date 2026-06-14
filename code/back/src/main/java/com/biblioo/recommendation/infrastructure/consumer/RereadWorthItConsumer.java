package com.biblioo.recommendation.infrastructure.consumer;

import com.biblioo.infrastructure.messaging.config.RabbitMQConfig;
import com.biblioo.infrastructure.messaging.model.EventMessage;
import com.biblioo.recommendation.domain.exception.DuplicateEventException;
import com.biblioo.recommendation.domain.service.RereadWorthItService;
import com.biblioo.recommendation.infrastructure.persistence.EventLogRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class RereadWorthItConsumer {

  private static final String TRAIL = "REREAD_WORTH_IT";
  private static final String LOG_PREFIX = "[RWI-Consumer]";

  private final RereadWorthItService rereadWorthItService;
  private final EventLogRepository eventLogRepository;
  private final ObjectMapper objectMapper;

  /**
   * Prefixo "RWI:" isola a chave de idempotência dos demais trails que consomem o mesmo
   * shelf.reading.completed (BYR, FGN, CS).
   */
  @RabbitListener(
      queues = RabbitMQConfig.RWI_QUEUE,
      containerFactory = "rereadWorthItListenerFactory")
  public void handle(EventMessage message) {
    String eventId = message.getEventId();
    String logKey = "RWI:" + eventId;

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

      rereadWorthItService.compute(userId);

    } catch (Exception ex) {
      log.error("{} Falha ao processar event_id={}: {}", LOG_PREFIX, eventId, ex.getMessage(), ex);
      throw new RuntimeException(ex);
    } finally {
      MDC.clear();
    }
  }
}
