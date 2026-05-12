package com.biblioo.community.infrastructure.messaging;

import com.biblioo.community.domain.port.out.VotingBroadcastPort;
import com.biblioo.community.infrastructure.dto.voting.VotingBroadcastEnvelope;
import com.biblioo.community.infrastructure.dto.voting.VotingEventPayload;
import com.biblioo.infrastructure.messaging.config.RabbitMQConfig;
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
public class VotingBroadcastAdapter implements VotingBroadcastPort {

  private static final String TOPIC_PREFIX = "/topic/community.";
  private static final String VOTING_SUFFIX = ".voting";

  private final SimpMessagingTemplate messagingTemplate;
  private final RabbitTemplate rabbitTemplate;
  private final ApplicationInstanceId applicationInstanceId;

  @Override
  public void broadcast(Long communityId, VotingEventPayload event) {
    String destination = TOPIC_PREFIX + communityId + VOTING_SUFFIX;
    scheduleOrSend(destination, event);
  }

  private void scheduleOrSend(String destination, VotingEventPayload event) {
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

  private void deliverLocally(String destination, VotingEventPayload event) {
    messagingTemplate.convertAndSend(destination, event);
  }

  private void publishToOtherInstances(String destination, VotingEventPayload event) {
    try {
      VotingBroadcastEnvelope envelope = new VotingBroadcastEnvelope(destination, event);
      rabbitTemplate.convertAndSend(
          RabbitMQConfig.COMMUNITY_BROADCAST_EXCHANGE,
          "",
          envelope,
          msg -> {
            msg.getMessageProperties()
                .setHeader(WebSocketMessageBroadcastAdapter.HEADER_INSTANCE_ID, applicationInstanceId.getValue());
            msg.getMessageProperties().setHeader("x-envelope-type", "voting");
            return msg;
          });
    } catch (Exception e) {
      log.warn(
          "[VotingBroadcast] Falha ao publicar cross-instance dest={}: {}",
          destination,
          e.getMessage());
    }
  }
}
