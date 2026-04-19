package com.biblioo.community.infrastructure.dto;

import java.time.LocalDateTime;
import java.util.List;

public record CommunityPostResponse(
    Long id,
    Long communityId,
    Long userId,
    String text,
    List<String> images,
    String gifUrl,
    List<String> tags,
    Boolean hasSpoiler,
    Integer pageRef,
    Integer likeCount,
    Integer commentCount,
    LocalDateTime createdAt,
    LocalDateTime updatedAt) {}
