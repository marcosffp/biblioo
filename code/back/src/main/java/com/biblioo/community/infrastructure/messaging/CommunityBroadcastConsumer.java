package com.biblioo.community.infrastructure.messaging;

import com.biblioo.community.infrastructure.dto.community.CommunityBroadcastEnvelope;
import com.biblioo.community.infrastructure.dto.message.TypingEventPayload;
import com.biblioo.community.infrastructure.dto.voting.VotingBroadcastEnvelope;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;


@Slf4j
@Component
@RequiredArgsConstructor
public class CommunityBroadcastConsumer {

  private final SimpMessagingTemplate messagingTemplate;
  private final ObjectMapper objectMapper;
  private final ApplicationInstanceId applicationInstanceId;

  @RabbitListener(
      queues = "#{communityBroadcastQueue.name}",
      containerFactory = "communityBroadcastListenerFactory")
  public void handle(Message amqpMessage) {
    String senderInstanceId =
        (String)
            amqpMessage.getMessageProperties().getHeader(WebSocketMessageBroadcastAdapter.HEADER_INSTANCE_ID);

    if (applicationInstanceId.getValue().equals(senderInstanceId)) {
      return;
    }

    String envelopeType =
        (String) amqpMessage.getMessageProperties().getHeader("x-envelope-type");

    try {
      if ("typing".equals(envelopeType)) {
        String destination =
            (String) amqpMessage.getMessageProperties().getHeader("x-destination");
        TypingEventPayload payload =
            objectMapper.readValue(amqpMessage.getBody(), TypingEventPayload.class);
        messagingTemplate.convertAndSend(destination, payload);
      } else if ("voting".equals(envelopeType)) {
        VotingBroadcastEnvelope envelope =
            objectMapper.readValue(amqpMessage.getBody(), VotingBroadcastEnvelope.class);
        messagingTemplate.convertAndSend(envelope.destination(), envelope.payload());
      } else {
        CommunityBroadcastEnvelope envelope =
            objectMapper.readValue(amqpMessage.getBody(), CommunityBroadcastEnvelope.class);
        messagingTemplate.convertAndSend(envelope.destination(), envelope.payload());
      }
    } catch (Exception e) {
      log.warn(
          "[CommunityBroadcast] Falha ao processar broadcast de outra instância: {}",
          e.getMessage());
    }
  }
}
