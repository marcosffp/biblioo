package com.biblioo.feed.infrastructure.dto.post;

import java.time.LocalDateTime;

public record FeedPostBasicResponse(
    Long id,
    Long userId,
    Long bookId,
    String text,
    Integer commentCount,
    Integer likeCount,
    LocalDateTime createdAt) {}
