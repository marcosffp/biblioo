package com.biblioo.user.infrastructure.config;

import com.biblioo.user.domain.port.in.AuthUseCase;
import com.biblioo.user.domain.port.in.UserUseCase;
import com.biblioo.user.domain.port.out.ProfileImagePort;
import com.biblioo.user.domain.port.out.RefreshTokenRepositoryPort;
import com.biblioo.user.domain.port.out.UserFollowRepositoryPort;
import com.biblioo.user.domain.port.out.UserRepositoryPort;
import com.biblioo.user.domain.port.out.UserSearchPort;
import com.biblioo.user.domain.service.UserService;
import com.biblioo.user.infrastructure.async.TokenCleanupAdapter;
import com.biblioo.user.infrastructure.auth.AuthServiceImpl;
import com.biblioo.user.infrastructure.cache.CachedUserService;
import com.biblioo.user.infrastructure.security.JwtService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
class UserConfig {

  @Bean
  AuthUseCase authUseCase(
      UserRepositoryPort userRepo,
      RefreshTokenRepositoryPort tokenRepo,
      PasswordEncoder passwordEncoder,
      JwtService jwtService,
      TokenCleanupAdapter tokenCleanup,
      @Value("${jwt.refresh-token-expiration-days:7}") int refreshTokenExpirationDays) {
    return new AuthServiceImpl(
        userRepo, tokenRepo, passwordEncoder, jwtService, tokenCleanup, refreshTokenExpirationDays);
  }

  @Bean
  UserUseCase userUseCase(
      UserRepositoryPort userRepo,
      UserFollowRepositoryPort followRepo,
      ProfileImagePort profileImagePort,
      RefreshTokenRepositoryPort tokenRepo,
      UserSearchPort searchPort) {
    return new CachedUserService(
        new UserService(userRepo, followRepo, profileImagePort, tokenRepo, searchPort));
  }
}
