package com.biblioo.feed.infrastructure.dto.review;

public record ReviewBasicResponse(
    Long id,
    Long userId,
    Long bookId,
    Integer rating,
    Boolean hasSpoiler,
    Integer commentCount,
    Integer likeCount
) {}
