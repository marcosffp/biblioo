package com.biblioo.feed.infrastructure.dto.review;

import java.util.List;

public record ReviewResponse(
    Long id,
    Long userId,
    Long bookId,
    String text,
    List<String> images,
    String gifUrl,
    List<String> tags,
    Boolean hasSpoiler,
    Integer rating,
    Integer commentCount,
    Integer likeCount) {}
