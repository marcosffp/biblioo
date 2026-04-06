package com.biblioo.infrastructure.messaging.adapter;

import com.biblioo.infrastructure.messaging.config.RabbitMQConfig;
import com.biblioo.infrastructure.messaging.model.EventMessage;
import com.biblioo.infrastructure.messaging.model.OutboxEvent;
import com.biblioo.infrastructure.messaging.port.EventPublisherPort;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RabbitMQEventPublisher implements EventPublisherPort {

  private final RabbitTemplate rabbitTemplate;
  private final ObjectMapper objectMapper;

  @Override
  public void publish(OutboxEvent event) {
    try {
      EventMessage message =
          EventMessage.builder()
              .eventId(event.getId())
              .eventType(event.getEventType())
              .aggregateType(event.getAggregateType())
              .aggregateId(event.getAggregateId())
              .timestamp(LocalDateTime.now())
              .payload(
                  event.getPayload() != null ? objectMapper.readTree(event.getPayload()) : null)
              .build();

      rabbitTemplate.convertAndSend(RabbitMQConfig.MAIN_EXCHANGE, event.getRoutingKey(), message);

      System.out.println(
          "Evento publicado "
              + event.getId()
              + " ["
              + event.getEventType()
              + "] → exchange='"
              + RabbitMQConfig.MAIN_EXCHANGE
              + "' routingKey='"
              + event.getRoutingKey()
              + "'");

    } catch (Exception e) {
      System.err.println(
          "Falha ao publicar evento "
              + event.getId()
              + " ["
              + event.getEventType()
              + "] no RabbitMQ: "
              + e.getMessage());
      e.printStackTrace();
    }
  }
}
