package com.biblioo.community.infrastructure.messaging;

import com.biblioo.community.domain.model.CommunityMessage;
import com.biblioo.community.domain.port.out.MessageBroadcastPort;
import com.biblioo.community.infrastructure.dto.MessageEventPayload;
import com.biblioo.community.infrastructure.dto.MessageResponse;
import com.biblioo.community.infrastructure.dto.mapper.CommunityMessageMapper;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Component
@RequiredArgsConstructor
public class WebSocketMessageBroadcastAdapter implements MessageBroadcastPort {

  private static final String TOPIC_PREFIX = "/topic/community.";

  private final SimpMessagingTemplate messagingTemplate;
  private final CommunityMessageMapper mapper;

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
              messagingTemplate.convertAndSend(destination, event);
            }
          });
    } else {
      messagingTemplate.convertAndSend(destination, event);
    }
  }
}
