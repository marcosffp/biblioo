package com.biblioo.recommendation.domain.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(
    name = "community_trending_scores",
    indexes = {@Index(name = "idx_cts_score", columnList = "current_score DESC")})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommunityTrendingScore {

  @Id
  @Column(name = "book_id")
  private Long bookId;

  @Column(name = "current_score", nullable = false)
  private Double currentScore;

  @Column(name = "last_updated", nullable = false)
  private LocalDateTime lastUpdated;
}
