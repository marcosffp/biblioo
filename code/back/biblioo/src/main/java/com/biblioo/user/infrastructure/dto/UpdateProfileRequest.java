package com.biblioo.user.infrastructure.dto;

import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
    @Size(max = 500) String bio, String avatarUrl, String bannerUrl) {}
