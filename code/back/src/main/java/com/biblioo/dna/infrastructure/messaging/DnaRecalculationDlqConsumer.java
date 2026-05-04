package com.biblioo.dna.infrastructure.messaging;

import com.biblioo.infrastructure.messaging.config.RabbitMQConfig;
import com.biblioo.infrastructure.messaging.model.EventMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class DnaRecalculationDlqConsumer {

  @RabbitListener(queues = RabbitMQConfig.DNA_RECALC_DLQ)
  public void handleDlq(EventMessage message) {
    log.error(
        "[DNA-DLQ] Evento na fila morta event_id={} type={} aggregate={}",
        message.getEventId(),
        message.getEventType(),
        message.getAggregateId());
  }
}
