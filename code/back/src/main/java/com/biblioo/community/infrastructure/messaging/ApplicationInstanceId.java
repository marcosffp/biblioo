package com.biblioo.community.infrastructure.messaging;

import java.util.UUID;
import org.springframework.stereotype.Component;

/**
 * UUID único desta instância da aplicação, gerado uma única vez no startup do contexto Spring.
 * Usado pelo WebSocketMessageBroadcastAdapter (publisher) e CommunityBroadcastConsumer (consumer)
 * para identificar e descartar mensagens AMQP originadas pela própria instância.
 */
@Component
public class ApplicationInstanceId {

  private final String value = UUID.randomUUID().toString();

  public String getValue() {
    return value;
  }
}
