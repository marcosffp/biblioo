package com.biblioo.community.infrastructure.dto.community;

import com.biblioo.community.domain.model.enumeration.InviteStatus;
import java.time.LocalDateTime;

public record CommunityInviteResponse(
    Long id,
    Long communityId,
    String communityName,
    Long inviterId,
    String inviterUsername,
    InviteStatus status,
    LocalDateTime createdAt) {}
