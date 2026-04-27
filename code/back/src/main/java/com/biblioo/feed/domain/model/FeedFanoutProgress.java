package com.biblioo.feed.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(
    name = "feed_fanout_progress",
    indexes = {@Index(name = "idx_fanout_status", columnList = "status")},
    uniqueConstraints = {
      @UniqueConstraint(name = "uq_fanout_event", columnNames = "event_id")
    })
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedFanoutProgress {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "event_id", nullable = false, unique = true)
  private String eventId;

  @Column(name = "content_id", nullable = false)
  private Long contentId;

  @Column(name = "author_id", nullable = false)
  private Long authorId;

  @Column(name = "last_processed_follower_id", nullable = false)
  private Long lastProcessedFollowerId;

  @Column(name = "total_processed", nullable = false)
  private Integer totalProcessed;

  @Enumerated(EnumType.STRING)
  @Column(name = "status", nullable = false)
  private FanoutStatus status;

  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt;

  @Column(name = "updated_at", nullable = false)
  private LocalDateTime updatedAt;

  @PrePersist
  void prePersist() {
    createdAt = LocalDateTime.now();
    updatedAt = LocalDateTime.now();
  }

  @PreUpdate
  void preUpdate() {
    updatedAt = LocalDateTime.now();
  }
}
