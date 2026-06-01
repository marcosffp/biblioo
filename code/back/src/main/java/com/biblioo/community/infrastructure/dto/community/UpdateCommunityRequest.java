package com.biblioo.community.infrastructure.dto.community;

import jakarta.validation.constraints.Size;

public record UpdateCommunityRequest(
    @Size(min = 3, max = 100) String name, @Size(max = 500) String description) {}
