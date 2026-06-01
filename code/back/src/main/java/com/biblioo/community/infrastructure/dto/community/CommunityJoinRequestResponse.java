package com.biblioo.community.infrastructure.dto.community;

import java.time.LocalDateTime;

import com.biblioo.community.domain.model.enumeration.JoinRequestStatus;

public record CommunityJoinRequestResponse(
    Long id,
    Long userId,
    String username,
    String avatarUrl,
    JoinRequestStatus status,
    LocalDateTime createdAt) {}
