package com.biblioo.feed.infrastructure.dto.review;

public record ReviewResponse(
    Long id,
    Long userId,
    Long bookId,
    String text,
    Integer rating,
    Integer commentCount,
    Integer likeCount) {}
