package com.biblioo.user.domain.port.out;

public interface TokenGeneratorPort {

  String generateAccessToken(Long userId, String email, String username);

  String generateRefreshToken();

  Long extractUserId(String accessToken);

  boolean isValidAccessToken(String accessToken);
}
