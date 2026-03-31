package com.biblioo.infrastructure.messaging.port;

import com.biblioo.infrastructure.messaging.model.OutboxEvent;

public interface EventPublisherPort {

  void publish(OutboxEvent event);
}
