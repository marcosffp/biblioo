package com.biblioo.community.infrastructure.dto.community;

import java.time.LocalDateTime;

import com.biblioo.community.domain.model.enumeration.CommunityType;

public record CommunityResponse(
    Long id,
    String name,
    String description,
    CommunityType type,
    Long bookId,
    Long ownerId,
    Integer memberCount,
    LocalDateTime createdAt) {}
