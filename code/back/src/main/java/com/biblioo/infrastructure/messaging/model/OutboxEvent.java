package com.biblioo.infrastructure.messaging.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(
    name = "outbox_events",
    indexes = {
      @Index(name = "idx_outbox_status", columnList = "status"),
      @Index(name = "idx_outbox_event_type", columnList = "event_type"),
      @Index(name = "idx_outbox_created_at", columnList = "created_at")
    })
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OutboxEvent {

  @Id
  @Column(length = 36)
  private String id;

  @Column(name = "event_type", nullable = false, length = 100)
  private String eventType;

  @Column(name = "aggregate_type", nullable = false, length = 100)
  private String aggregateType;

  @Column(name = "aggregate_id", nullable = false, length = 100)
  private String aggregateId;

  @Column(name = "routing_key", nullable = false, length = 200)
  private String routingKey;

  @Lob
  @Column(name = "payload", nullable = false)
  private String payload;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private OutboxEventStatus status;

  @Column(nullable = false)
  @Builder.Default
  private Integer attempts = 0;

  @Column(name = "error_message", columnDefinition = "TEXT")
  private String errorMessage;

  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Column(name = "processed_at")
  private LocalDateTime processedAt;

  @PrePersist
  void onCreate() {
    this.createdAt = LocalDateTime.now();
  }
}
