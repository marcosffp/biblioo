package com.biblioo.community.infrastructure.dto;

import com.biblioo.community.domain.model.CommunityRole;
import java.time.LocalDateTime;

public record CommunityMemberResponse(
    Long userId, String username, String avatarUrl, CommunityRole role, LocalDateTime joinedAt) {}
