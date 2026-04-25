package com.biblioo.community.infrastructure.messaging;

import com.biblioo.community.domain.model.CommunityMessage;
import com.biblioo.community.domain.port.out.MessageBroadcastPort;
import com.biblioo.community.infrastructure.dto.CommunityBroadcastEnvelope;
import com.biblioo.community.infrastructure.dto.MessageEventPayload;
import com.biblioo.community.infrastructure.dto.MessageResponse;
import com.biblioo.community.infrastructure.dto.mapper.CommunityMessageMapper;
import com.biblioo.infrastructure.messaging.config.RabbitMQConfig;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketMessageBroadcastAdapter implements MessageBroadcastPort {

  private static final String TOPIC_PREFIX = "/topic/community.";
  static final String HEADER_INSTANCE_ID = "x-instance-id";

  private final SimpMessagingTemplate messagingTemplate;
  private final CommunityMessageMapper mapper;
  private final RabbitTemplate rabbitTemplate;
  private final ApplicationInstanceId applicationInstanceId;

  @Override
  public void broadcastNewMessage(CommunityMessage message) {
    MessageEventPayload event =
        new MessageEventPayload(MessageEventPayload.MESSAGE_CREATED, mapper.toResponse(message));
    scheduleOrSend(TOPIC_PREFIX + message.getCommunityId(), event);
  }

  @Override
  public void broadcastEdit(CommunityMessage message) {
    MessageEventPayload event =
        new MessageEventPayload(MessageEventPayload.MESSAGE_UPDATED, mapper.toResponse(message));
    scheduleOrSend(TOPIC_PREFIX + message.getCommunityId() + ".edits", event);
  }

  @Override
  public void broadcastDelete(Long communityId, Long messageId) {
    MessageResponse tombstone =
        new MessageResponse(
            messageId,
            null,
            communityId,
            null,
            "",
            null,
            Set.of(),
            List.of(),
            null,
            false,
            0,
            true,
            LocalDateTime.now(),
            null);
    MessageEventPayload event =
        new MessageEventPayload(MessageEventPayload.MESSAGE_DELETED, tombstone);
    scheduleOrSend(TOPIC_PREFIX + communityId + ".edits", event);
  }

  @Override
  public void broadcastReaction(Long communityId, Long messageId, int newHeartCount) {
    MessageResponse reaction =
        new MessageResponse(
            messageId,
            null,
            communityId,
            null,
            null,
            null,
            null,
            List.of(),
            null,
            false,
            newHeartCount,
            false,
            null,
            null);
    MessageEventPayload event =
        new MessageEventPayload(MessageEventPayload.REACTION_UPDATED, reaction);
    scheduleOrSend(TOPIC_PREFIX + communityId + ".reactions", event);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private void scheduleOrSend(String destination, MessageEventPayload event) {
    if (TransactionSynchronizationManager.isActualTransactionActive()) {
      TransactionSynchronizationManager.registerSynchronization(
          new TransactionSynchronization() {
            @Override
            public void afterCommit() {
              deliverLocally(destination, event);
              publishToOtherInstances(destination, event);
            }
          });
    } else {
      deliverLocally(destination, event);
      publishToOtherInstances(destination, event);
    }
  }

  private void deliverLocally(String destination, MessageEventPayload event) {
    messagingTemplate.convertAndSend(destination, event);
  }

  private void publishToOtherInstances(String destination, MessageEventPayload event) {
    try {
      CommunityBroadcastEnvelope envelope = new CommunityBroadcastEnvelope(destination, event);
      rabbitTemplate.convertAndSend(
          RabbitMQConfig.COMMUNITY_BROADCAST_EXCHANGE,
          "",
          envelope,
          msg -> {
            msg.getMessageProperties().setHeader(HEADER_INSTANCE_ID, applicationInstanceId.getValue());
            return msg;
          });
    } catch (Exception e) {
      log.warn("[WebSocket] Falha ao publicar broadcast cross-instance dest={}: {}",
          destination, e.getMessage());
    }
  }
}
