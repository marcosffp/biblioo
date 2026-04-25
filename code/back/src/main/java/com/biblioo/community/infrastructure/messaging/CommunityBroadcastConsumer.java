package com.biblioo.community.infrastructure.messaging;

import com.biblioo.community.infrastructure.dto.CommunityBroadcastEnvelope;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

/**
 * Recebe broadcasts de outras instâncias via AMQP FanoutExchange e entrega ao SimpleBroker local.
 *
 * <p>Cada instância tem sua própria AnonymousQueue efêmera. Mensagens publicadas pela própria
 * instância são descartadas pelo header x-instance-id para evitar entrega duplicada (a instância
 * já fez a entrega local diretamente em WebSocketMessageBroadcastAdapter).
 */
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

    try {
      CommunityBroadcastEnvelope envelope =
          objectMapper.readValue(amqpMessage.getBody(), CommunityBroadcastEnvelope.class);
      messagingTemplate.convertAndSend(envelope.destination(), envelope.payload());
    } catch (Exception e) {
      log.warn(
          "[CommunityBroadcast] Falha ao processar broadcast de outra instância: {}",
          e.getMessage());
    }
  }
}
