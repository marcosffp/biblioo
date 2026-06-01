package com.biblioo.recommendation.domain.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(
    name = "community_trending_dedup",
    uniqueConstraints =
        @UniqueConstraint(
            name = "uq_dedup_user_book_type",
            columnNames = {"user_id", "book_id", "event_type"}),
    indexes = {
      @Index(name = "idx_dedup_user_book_type", columnList = "user_id, book_id, event_type"),
      @Index(name = "idx_dedup_contributed_at", columnList = "contributed_at")
    })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommunityTrendingDedup {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "user_id", nullable = false)
  private Long userId;

  @Column(name = "book_id", nullable = false)
  private Long bookId;

  @Column(name = "event_type", nullable = false, length = 20)
  private String eventType;

  @Column(name = "contributed_at", nullable = false)
  private LocalDateTime contributedAt;
}
