package com.biblioo.recommendation.domain.model;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FavoriteGenreNowResult {
  private List<String> topGenres;
  private List<BookScore> books;
}
