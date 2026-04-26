package com.biblioo.recommendation.domain.model;

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
@Table(
    name = "recommendation_results",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "trail_type"}))
public class RecommendationResult {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "user_id", nullable = false)
  private Long userId;

  @Column(name = "trail_type", nullable = false, length = 30)
  private String trailType;

  @Column(name = "books", nullable = false, columnDefinition = "JSON")
  private String books;

  @Column(name = "computed_at", nullable = false)
  private LocalDateTime computedAt;

  @Column(name = "metadata", columnDefinition = "JSON")
  private String metadata;
}
