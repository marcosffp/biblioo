package com.biblioo.recommendation.infrastructure.dto;

import com.biblioo.recommendation.domain.model.GenreTranslation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GenreResponse {
  private String original;
  private String translated;

  public static GenreResponse from(GenreTranslation t) {
    return GenreResponse.builder().original(t.getOriginal()).translated(t.getTranslated()).build();
  }
}
