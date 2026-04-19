package com.biblioo.community.infrastructure.dto;

import com.biblioo.community.domain.model.InviteStatus;
import java.time.LocalDateTime;

public record CommunityInviteResponse(
    Long id,
    Long communityId,
    String communityName,
    Long inviterId,
    String inviterUsername,
    InviteStatus status,
    LocalDateTime createdAt) {}
