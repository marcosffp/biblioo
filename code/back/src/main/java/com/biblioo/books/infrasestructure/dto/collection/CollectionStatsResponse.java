package com.biblioo.books.infrasestructure.dto.collection;

import java.util.List;

public record CollectionStatsResponse(
    ProgressStats progress, List<GenreStats> topGenres, Double averageRating) {

  public record ProgressStats(
      int completed,
      int reading,
      int abandoned,
      int completedPercent,
      int readingPercent,
      int abandonedPercent) {}

  public record GenreStats(String genre, int count, int percent) {}
}
