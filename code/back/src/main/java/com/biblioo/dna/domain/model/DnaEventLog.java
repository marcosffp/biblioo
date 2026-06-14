package com.biblioo.dna.domain.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "dna_event_log", indexes = @Index(columnList = "event_id", unique = true))
public class DnaEventLog {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "event_id", nullable = false, unique = true, length = 60)
  private String eventId;

  @Column(name = "event_type", nullable = false, length = 60)
  private String eventType;

  @Column(name = "user_id", nullable = false)
  private Long userId;

  @Column(name = "payload", columnDefinition = "JSON")
  private String payload;

  @Column(name = "processed_at", nullable = false)
  private LocalDateTime processedAt;
}
