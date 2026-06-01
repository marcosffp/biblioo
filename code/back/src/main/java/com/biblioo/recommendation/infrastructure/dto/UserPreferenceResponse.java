package com.biblioo.recommendation.infrastructure.dto;

import com.biblioo.recommendation.domain.model.UserPreference;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPreferenceResponse {
  private Long userId;
  private List<String> genres;
  private List<Long> bookIds;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;

  public static UserPreferenceResponse from(UserPreference p) {
    return UserPreferenceResponse.builder()
        .userId(p.getUserId())
        .genres(p.getGenres())
        .bookIds(p.getBookIds())
        .createdAt(p.getCreatedAt())
        .updatedAt(p.getUpdatedAt())
        .build();
  }
}
