package com.biblioo.recommendation.infrastructure.consumer;

import com.biblioo.infrastructure.messaging.config.RabbitMQConfig;
import com.biblioo.infrastructure.messaging.model.EventMessage;
import com.biblioo.recommendation.domain.exception.DuplicateEventException;
import com.biblioo.recommendation.domain.service.CatalogSurpriseService;
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
public class CatalogSurpriseConsumer {

  private static final String TRAIL = "CATALOG_SURPRISE";
  private static final String LOG_PREFIX = "[CS-Consumer]";

  private final CatalogSurpriseService catalogSurpriseService;
  private final EventLogRepository eventLogRepository;
  private final ObjectMapper objectMapper;

  /**
   * Ouve eventos de COMPLETED e ABANDONED na mesma fila (dois bindings distintos).
   * Atualiza α ou β no Redis conforme o tipo do evento, alimentando o bandit para o próximo
   * request de recomendação.
   *
   * <p>Prefixo "CS:" isola a chave de idempotência dos demais trails que consomem
   * o mesmo eventId (ex.: BYR e FGN também consomem shelf.reading.completed).
   */
  @RabbitListener(
      queues = RabbitMQConfig.CATALOG_SURPRISE_QUEUE,
      containerFactory = "catalogSurpriseListenerFactory")
  public void handle(EventMessage message) {
    String eventId = message.getEventId();
    String logKey = "CS:" + eventId;

    MDC.put("event_id", eventId);
    MDC.put("trail", TRAIL);
    try {
      if (eventLogRepository.existsByEventId(logKey)) {
        log.info("{} Evento duplicado event_id={}, descartando", LOG_PREFIX, eventId);
        return;
      }

      Long bookId = Long.parseLong(message.getAggregateId());
      Long userId = message.getPayload().get("userId").asLong();
      String status = resolveInteractionStatus(message.getEventType());

      if (status == null) {
        log.warn("{} Tipo de evento não mapeado: {}", LOG_PREFIX, message.getEventType());
        return;
      }

      log.info(
          "{} Processando event_id={} user={} book={} status={}",
          LOG_PREFIX,
          eventId,
          userId,
          bookId,
          status);

      try {
        eventLogRepository.registerEvent(
            logKey, TRAIL, userId, objectMapper.writeValueAsString(message.getPayload()));
      } catch (DuplicateEventException ex) {
        log.info("{} Race condition em event_id={}, descartando", LOG_PREFIX, eventId);
        return;
      }

      catalogSurpriseService.updateBanditState(userId, bookId, status);

      log.info(
          "{} Concluído event_id={} user={} book={}", LOG_PREFIX, eventId, userId, bookId);

    } catch (Exception ex) {
      log.error(
          "{} Falha ao processar event_id={}: {}", LOG_PREFIX, eventId, ex.getMessage(), ex);
      throw new RuntimeException(ex);
    } finally {
      MDC.clear();
    }
  }

  private String resolveInteractionStatus(String eventType) {
    return switch (eventType) {
      case RabbitMQConfig.EVENT_SHELF_READING_COMPLETED -> "COMPLETED";
      case RabbitMQConfig.EVENT_SHELF_READING_ABANDONED -> "ABANDONED";
      default -> null;
    };
  }
}
