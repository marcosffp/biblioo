package com.biblioo.community.infrastructure.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

public record MessageResponse(
    Long id,
    String clientMessageId,
    Long communityId,
    Long authorId,
    String content,
    Long parentMessageId,
    Set<String> tags,
    List<String> images,
    String gifUrl,
    boolean hasSpoiler,
    int heartCount,
    boolean deleted,
    LocalDateTime createdAt,
    LocalDateTime editedAt) {}
