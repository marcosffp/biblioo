package com.biblioo.community.infrastructure.dto.community;

import java.time.LocalDateTime;

import com.biblioo.community.domain.model.enumeration.InviteStatus;

public record CommunityInviteResponse(
    Long id,
    Long communityId,
    String communityName,
    Long inviterId,
    String inviterUsername,
    InviteStatus status,
    LocalDateTime createdAt) {}
