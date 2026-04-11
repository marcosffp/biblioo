package com.biblioo.notification.infrastructure.consumer;

import com.biblioo.infrastructure.messaging.config.RabbitMQConfig;
import com.biblioo.infrastructure.messaging.model.EventMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class NotificationDlqConsumer {

  @RabbitListener(queues = RabbitMQConfig.NOTIFICATION_DLQ)
  public void handle(EventMessage message) {
    log.error(
        "[Notification-DLQ] Evento {} [{}] para aggregateId={} chegou à DLQ após esgotar todas as tentativas.",
        message.getEventId(),
        message.getEventType(),
        message.getAggregateId());
  }
}
