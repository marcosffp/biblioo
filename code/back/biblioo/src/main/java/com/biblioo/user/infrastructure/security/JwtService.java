package com.biblioo.user.infrastructure.security;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.util.Date;
import java.util.UUID;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class JwtService {

  private final SecretKey signingKey;
  private final long accessTokenExpirationSeconds;

  public JwtService(
      @Value("${jwt.secret}") String secret,
      @Value("${jwt.access-token-expiration:3600}") long accessTokenExpirationSeconds) {
    this.signingKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
    this.accessTokenExpirationSeconds = accessTokenExpirationSeconds;
  }

  public String generateAccessToken(Long userId, String email, String username) {
    return Jwts.builder()
        .subject(userId.toString())
        .claim("email", email)
        .claim("username", username)
        .issuedAt(new Date())
        .expiration(new Date(System.currentTimeMillis() + accessTokenExpirationSeconds * 1000))
        .signWith(signingKey)
        .compact();
  }

  public String generateRefreshToken() {
    return UUID.randomUUID().toString();
  }

  public Long extractUserId(String token) {
    return Long.parseLong(
        Jwts.parser()
            .verifyWith(signingKey)
            .build()
            .parseSignedClaims(token)
            .getPayload()
            .getSubject());
  }

  public boolean isValidAccessToken(String token) {
    try {
      Jwts.parser().verifyWith(signingKey).build().parseSignedClaims(token);
      return true;
    } catch (JwtException | IllegalArgumentException e) {
      return false;
    }
  }
}
