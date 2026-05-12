package com.biblioo.community.infrastructure.dto.message;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import com.biblioo.community.domain.model.enumeration.MessageType;

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
    MessageType type,
    LocalDateTime createdAt,
    LocalDateTime editedAt) {}
