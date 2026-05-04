package com.biblioo.feed.infrastructure.dto.post;

import java.time.LocalDateTime;
import java.util.List;

public record FeedPostResponse(
    Long id,
    Long userId,
    Long bookId,
    String text,
    List<String> images,
    String gifUrl,
    List<String> tags,
    Boolean hasSpoiler,
    Integer commentCount,
    Integer likeCount,
    LocalDateTime createdAt,
    LocalDateTime updatedAt) {}
