package com.biblioo.feed.infrastructure.dto.review;

import java.time.LocalDateTime;

public record ReviewResponse(
    Long id,
    Long userId,
    Long bookId,
    String text,
    Integer rating,
    Integer commentCount,
    Integer likeCount,
    LocalDateTime createdAt,
    boolean likedByCurrentUser) {

  public ReviewResponse copyWithLikeStatus(boolean liked) {
    return new ReviewResponse(id, userId, bookId, text, rating, commentCount, likeCount, createdAt, liked);
  }
}
