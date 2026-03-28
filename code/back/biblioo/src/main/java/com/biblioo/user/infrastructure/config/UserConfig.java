package com.biblioo.user.infrastructure.config;

import com.biblioo.user.domain.port.in.AuthUseCase;
import com.biblioo.user.domain.port.in.UserUseCase;
import com.biblioo.user.domain.port.out.PasswordEncoderPort;
import com.biblioo.user.domain.port.out.ProfileImagePort;
import com.biblioo.user.domain.port.out.RefreshTokenRepositoryPort;
import com.biblioo.user.domain.port.out.TokenCleanupPort;
import com.biblioo.user.domain.port.out.TokenGeneratorPort;
import com.biblioo.user.domain.port.out.UserFollowRepositoryPort;
import com.biblioo.user.domain.port.out.UserRepositoryPort;
import com.biblioo.user.domain.service.AuthService;
import com.biblioo.user.domain.service.UserService;
import com.biblioo.user.infrastructure.cache.CachedUserService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
class UserConfig {

  @Bean
  AuthUseCase authUseCase(
      UserRepositoryPort userRepo,
      RefreshTokenRepositoryPort tokenRepo,
      PasswordEncoderPort passwordEncoder,
      TokenGeneratorPort tokenGenerator,
      TokenCleanupPort tokenCleanup,
      @Value("${jwt.refresh-token-expiration-days:7}") int refreshTokenExpirationDays) {
    return new AuthService(
        userRepo, tokenRepo, passwordEncoder, tokenGenerator, tokenCleanup, refreshTokenExpirationDays);
  }

  @Bean
  UserUseCase userUseCase(
      UserRepositoryPort userRepo,
      UserFollowRepositoryPort followRepo,
      ProfileImagePort profileImagePort) {
    return new CachedUserService(new UserService(userRepo, followRepo, profileImagePort));
  }
}
