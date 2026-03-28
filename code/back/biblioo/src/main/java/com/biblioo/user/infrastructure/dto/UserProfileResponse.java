package com.biblioo.user.infrastructure.dto;

public record UserProfileResponse(
    Long id,
    String username,
    String email,
    String bio,
    String avatarUrl,
    String bannerUrl,
    boolean isPrivate,
    String createdAt) {}
