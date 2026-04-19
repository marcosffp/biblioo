package com.biblioo.community.infrastructure.dto;

import com.biblioo.community.domain.model.CommunityRole;
import jakarta.validation.constraints.NotNull;

public record ChangeRoleRequest(@NotNull CommunityRole role) {}
