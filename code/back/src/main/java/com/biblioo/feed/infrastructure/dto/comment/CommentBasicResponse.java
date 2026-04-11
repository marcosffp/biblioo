package com.biblioo.feed.infrastructure.dto.comment;

import java.time.LocalDateTime;

public record CommentBasicResponse(
    Long id,
    Long userId,
    Long parentId,
    String text,
    Integer likeCount,
    LocalDateTime createdAt) {}
