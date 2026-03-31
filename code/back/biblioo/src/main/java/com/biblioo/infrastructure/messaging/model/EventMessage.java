package com.biblioo.infrastructure.messaging.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.JsonNode;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class EventMessage {

  private String eventId;

  private String eventType;

  private String aggregateType;

  private String aggregateId;

  private LocalDateTime timestamp;

  private JsonNode payload;
}
