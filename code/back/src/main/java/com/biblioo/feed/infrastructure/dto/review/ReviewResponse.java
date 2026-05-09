package com.biblioo.feed.infrastructure.dto.review;

public record ReviewResponse(
    Long id,
    Long userId,
    Long bookId,
    String text,
    Integer rating,
    Integer commentCount,
    Integer likeCount,
    boolean likedByCurrentUser) {

  public ReviewResponse copyWithLikeStatus(boolean liked) {
    return new ReviewResponse(id, userId, bookId, text, rating, commentCount, likeCount, liked);
  }
}
