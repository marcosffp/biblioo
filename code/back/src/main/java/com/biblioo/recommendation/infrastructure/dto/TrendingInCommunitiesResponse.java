package com.biblioo.recommendation.infrastructure.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrendingInCommunitiesResponse {
  private List<RecommendationResponse> books;
}
