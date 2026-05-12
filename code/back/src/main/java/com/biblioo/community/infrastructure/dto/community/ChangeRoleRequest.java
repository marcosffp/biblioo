package com.biblioo.community.infrastructure.dto.community;

import com.biblioo.community.domain.model.enumeration.CommunityRole;

import jakarta.validation.constraints.NotNull;

public record ChangeRoleRequest(@NotNull CommunityRole role) {}
