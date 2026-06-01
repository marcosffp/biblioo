package com.biblioo.community.infrastructure.messaging;

import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class ApplicationInstanceId {

  private final String value = UUID.randomUUID().toString();

  public String getValue() {
    return value;
  }
}
