package com.biblioo.community.infrastructure.dto.community;

import java.time.LocalDateTime;

import com.biblioo.community.domain.model.enumeration.CommunityRole;
import com.biblioo.community.domain.model.enumeration.CommunityType;

public record CommunityDetailResponse(
    Long id,
    String name,
    String description,
    CommunityType type,
    Long bookId,
    Long ownerId,
    Integer memberCount,
    String inviteLink,
    LocalDateTime createdAt,
    CommunityRole currentUserRole) {}
