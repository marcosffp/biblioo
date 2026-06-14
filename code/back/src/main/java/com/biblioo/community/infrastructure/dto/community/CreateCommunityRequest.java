package com.biblioo.community.infrastructure.dto.community;

import com.biblioo.community.domain.model.enumeration.CommunityType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateCommunityRequest(
    @NotBlank @Size(min = 3, max = 100) String name,
    @Size(max = 500) String description,
    @NotNull CommunityType type,
    @NotNull Long bookId) {}
