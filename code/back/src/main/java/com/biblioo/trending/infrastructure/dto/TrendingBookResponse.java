package com.biblioo.trending.infrastructure.dto;

import com.biblioo.trending.domain.model.TrendingBookItem;

public record TrendingBookResponse(
    Long bookId,
    String title,
    String coverUrl,
    String author,
    Long newReviews,
    Long shelfAdditions,
    Long progressUpdates,
    Long reviewLikes,
    String reason,
    Double score) {

  public static TrendingBookResponse from(TrendingBookItem item) {
    return new TrendingBookResponse(
        item.bookId(),
        item.title(),
        item.coverUrl(),
        item.author(),
        item.newReviews(),
        item.shelfAdditions(),
        item.progressUpdates(),
        item.reviewLikes(),
        item.reason(),
        item.score());
  }
}
