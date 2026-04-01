package com.biblioo.user.infrastructure.dto;

public record AuthResponse(String accessToken, String refreshToken, UserProfileResponse user) {}
