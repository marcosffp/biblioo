package com.biblioo.community.infrastructure.dto.community;

import com.biblioo.community.domain.model.enumeration.CommunityRole;
import java.time.LocalDateTime;

public record CommunityMemberResponse(
    Long userId, String username, String avatarUrl, CommunityRole role, LocalDateTime joinedAt) {}
