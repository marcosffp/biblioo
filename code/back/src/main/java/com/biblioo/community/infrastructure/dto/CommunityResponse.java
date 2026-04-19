package com.biblioo.community.infrastructure.dto;

import com.biblioo.community.domain.model.CommunityType;
import java.time.LocalDateTime;

public record CommunityResponse(
    Long id,
    String name,
    String description,
    CommunityType type,
    Long bookId,
    Long ownerId,
    Integer memberCount,
    LocalDateTime createdAt) {}
