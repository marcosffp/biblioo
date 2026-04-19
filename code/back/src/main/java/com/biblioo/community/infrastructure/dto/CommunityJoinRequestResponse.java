package com.biblioo.community.infrastructure.dto;

import com.biblioo.community.domain.model.JoinRequestStatus;
import java.time.LocalDateTime;

public record CommunityJoinRequestResponse(
    Long id,
    Long userId,
    String username,
    String avatarUrl,
    JoinRequestStatus status,
    LocalDateTime createdAt) {}
