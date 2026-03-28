package com.biblioo.user.domain.model;

public record AuthResult(String accessToken, String refreshToken, User user) {}
