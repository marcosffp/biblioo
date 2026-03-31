package com.biblioo.books.infrasestructure.messaging;

import com.biblioo.infrastructure.messaging.config.RabbitMQConfig;
import com.biblioo.infrastructure.messaging.model.EventMessage;
import com.biblioo.infrastructure.messaging.service.OutboxEventService;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class BookStatsDlqConsumer {

  private final OutboxEventService outboxEventService;

  @RabbitListener(queues = RabbitMQConfig.BOOK_STATS_DLQ)
  public void handle(EventMessage message) {
    System.err.println(
        "Evento "
            + message.getEventId()
            + " ["
            + message.getEventType()
            + "] para aggregateId="
            + message.getAggregateId()
            + " chegou à DLQ após esgotar todas as tentativas de repetição.");

    outboxEventService.markAsFailed(
        message.getEventId(),
        "Mensagem chegou à DLQ após esgotar todas as tentativas de repetição");
  }
}
