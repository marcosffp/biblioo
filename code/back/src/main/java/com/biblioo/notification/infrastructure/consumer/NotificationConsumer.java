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

    private static final String PAYLOAD_RECIPIENT_ID = "recipientId";
    private static final String PAYLOAD_COMMUNITY_ID = "communityId";
    private static final String PAYLOAD_ACTOR_AVATAR_URL = "actorAvatarUrl";

  private final NotificationService notificationService;

  @RabbitListener(
      queues = RabbitMQConfig.NOTIFICATION_QUEUE,
      containerFactory = "notificationListenerFactory")
  public void handle(EventMessage message) {
    String eventId = message.getEventId();
    MDC.put("event_id", eventId);
    MDC.put("trail", "NOTIFICATION");

    try {
      JsonNode payload = message.getPayload();

      switch (message.getEventType()) {
        case RabbitMQConfig.EVENT_USER_FOLLOW_REQUESTED -> handleFollowRequested(payload);
        case RabbitMQConfig.EVENT_USER_FOLLOWED -> handleFollowed(payload);
        case RabbitMQConfig.EVENT_COMMUNITY_INVITE -> handleCommunityInvite(payload);
        case RabbitMQConfig.EVENT_COMMUNITY_JOIN_REQUEST -> handleCommunityJoinRequest(payload);
        case RabbitMQConfig.EVENT_COMMUNITY_JOIN_APPROVED -> handleCommunityJoinApproved(payload);
        default ->
            log.warn(
                "[Notification-Consumer] Tipo de evento desconhecido '{}' — ignorando",
                message.getEventType());
      }


    } catch (Exception ex) {
      log.error(
          "[Notification-Consumer] Falha ao processar event_id={}: {}",
          eventId,
          ex.getMessage(),
          ex);
            throw new IllegalStateException("Falha ao processar evento de notificacao", ex);
    } finally {
      MDC.clear();
    }
  }

    private void handleFollowRequested(JsonNode payload) {
        notificationService.createAndDeliver(
                NotificationType.USER_FOLLOW_REQUESTED,
                payload.get(PAYLOAD_RECIPIENT_ID).asLong(),
                payload.get("actorId").asLong(),
                payload.get("actorUsername").asText(),
                payload.hasNonNull(PAYLOAD_ACTOR_AVATAR_URL)
                        ? payload.get(PAYLOAD_ACTOR_AVATAR_URL).asText()
                        : null,
                null);
    }

    private void handleFollowed(JsonNode payload) {
        notificationService.createAndDeliver(
                NotificationType.USER_FOLLOWED,
                payload.get(PAYLOAD_RECIPIENT_ID).asLong(),
                payload.get("actorId").asLong(),
                payload.get("actorUsername").asText(),
                payload.hasNonNull(PAYLOAD_ACTOR_AVATAR_URL)
                        ? payload.get(PAYLOAD_ACTOR_AVATAR_URL).asText()
                        : null,
                null);
    }

    private void handleCommunityInvite(JsonNode payload) {
        notificationService.createAndDeliver(
                NotificationType.COMMUNITY_INVITE,
                payload.get(PAYLOAD_RECIPIENT_ID).asLong(),
                payload.get("inviterId").asLong(),
                payload.hasNonNull("inviterUsername") ? payload.get("inviterUsername").asText() : null,
                payload.hasNonNull("inviterAvatarUrl") ? payload.get("inviterAvatarUrl").asText() : null,
                payload.hasNonNull("inviteId") ? payload.get("inviteId").asLong() : null,
                payload.get(PAYLOAD_COMMUNITY_ID).asLong());
    }

    private void handleCommunityJoinRequest(JsonNode payload) {
        long requesterId = payload.get("requesterId").asLong();
        long communityId = payload.get(PAYLOAD_COMMUNITY_ID).asLong();
        String requesterUsername =
                payload.hasNonNull("requesterUsername") ? payload.get("requesterUsername").asText() : null;
        String requesterAvatarUrl =
                payload.hasNonNull("requesterAvatarUrl") ? payload.get("requesterAvatarUrl").asText() : null;

        for (JsonNode recipientNode : payload.get("recipientIds")) {
            notificationService.createAndDeliver(
                    NotificationType.COMMUNITY_JOIN_REQUEST,
                    recipientNode.asLong(),
                    requesterId,
                    requesterUsername,
                    requesterAvatarUrl,
                    communityId,
                    communityId);
        }
    }

    private void handleCommunityJoinApproved(JsonNode payload) {
        long communityId = payload.get(PAYLOAD_COMMUNITY_ID).asLong();
        notificationService.createAndDeliver(
                NotificationType.COMMUNITY_JOIN_APPROVED,
                payload.get(PAYLOAD_RECIPIENT_ID).asLong(),
                null,
                null,
                null,
                communityId,
                communityId);
    }
}
