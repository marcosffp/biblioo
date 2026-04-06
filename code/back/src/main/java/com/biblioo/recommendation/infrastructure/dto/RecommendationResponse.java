package com.biblioo.recommendation.infrastructure.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecommendationResponse {
  private Long id;
  private String title;
  private String description;
  private Integer pageCount;
  private Integer readerCount;
  private Float averageRating;
  private String coverUrl;
  private double score;
}
