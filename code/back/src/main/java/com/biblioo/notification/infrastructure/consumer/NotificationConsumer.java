package com.biblioo.notification.infrastructure.consumer;

import com.biblioo.infrastructure.messaging.config.RabbitMQConfig;
import com.biblioo.infrastructure.messaging.model.EventMessage;
import com.biblioo.notification.domain.model.NotificationType;
import com.biblioo.notification.domain.service.NotificationService;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationConsumer {

  private final NotificationService notificationService;

  @RabbitListener(
      queues = RabbitMQConfig.NOTIFICATION_QUEUE,
      containerFactory = "notificationListenerFactory")
  public void handle(EventMessage message) {
    String eventId = message.getEventId();
    MDC.put("event_id", eventId);
    MDC.put("trail", "NOTIFICATION");

    try {
      log.info(
          "[Notification-Consumer] Processando event_id={} type={}", eventId, message.getEventType());

      JsonNode payload = message.getPayload();

      switch (message.getEventType()) {
        case RabbitMQConfig.EVENT_USER_FOLLOW_REQUESTED ->
            notificationService.createAndDeliver(
                NotificationType.USER_FOLLOW_REQUESTED,
                payload.get("recipientId").asLong(),
                payload.get("actorId").asLong(),
                payload.get("actorUsername").asText(),
                payload.hasNonNull("actorAvatarUrl") ? payload.get("actorAvatarUrl").asText() : null,
                null);

        case RabbitMQConfig.EVENT_USER_FOLLOWED ->
            notificationService.createAndDeliver(
                NotificationType.USER_FOLLOWED,
                payload.get("recipientId").asLong(),
                payload.get("actorId").asLong(),
                payload.get("actorUsername").asText(),
                payload.hasNonNull("actorAvatarUrl") ? payload.get("actorAvatarUrl").asText() : null,
                null);

        default ->
            log.warn(
                "[Notification-Consumer] Tipo de evento desconhecido '{}' — ignorando",
                message.getEventType());
      }

      log.info("[Notification-Consumer] Concluído event_id={}", eventId);

    } catch (Exception ex) {
      log.error(
          "[Notification-Consumer] Falha ao processar event_id={}: {}",
          eventId,
          ex.getMessage(),
          ex);
      throw new RuntimeException(ex);
    } finally {
      MDC.clear();
    }
  }
}
