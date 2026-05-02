package com.biblioo.user.infrastructure.config;

import com.biblioo.user.domain.port.in.AuthUseCase;
import com.biblioo.user.domain.port.in.PasswordResetUseCase;
import com.biblioo.user.domain.port.in.UserUseCase;
import com.biblioo.user.domain.port.out.GoogleAuthPort;
import com.biblioo.user.domain.port.out.PasswordResetEmailPort;
import com.biblioo.user.domain.port.out.ProfileImagePort;
import com.biblioo.user.domain.port.out.UserNotificationEventPort;
import com.biblioo.user.domain.port.out.UserSearchPort;
import com.biblioo.user.domain.service.UserService;
import com.biblioo.user.infrastructure.async.TokenCleanupAdapter;
import com.biblioo.user.infrastructure.auth.AuthServiceImpl;
import com.biblioo.user.infrastructure.auth.GoogleUserFactory;
import com.biblioo.user.infrastructure.auth.PasswordResetService;
import com.biblioo.user.infrastructure.cache.CachedUserService;
import com.biblioo.user.infrastructure.persistence.PasswordResetTokenRepository;
import com.biblioo.user.infrastructure.persistence.RefreshTokenRepository;
import com.biblioo.user.infrastructure.persistence.UserFollowRepository;
import com.biblioo.user.infrastructure.persistence.UserRepository;
import com.biblioo.user.infrastructure.security.JwtService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
class UserConfig {

  @Bean
  AuthUseCase authUseCase(
      UserRepository userRepo,
      RefreshTokenRepository tokenRepo,
      PasswordEncoder passwordEncoder,
      JwtService jwtService,
      TokenCleanupAdapter tokenCleanup,
      @Value("${jwt.refresh-token-expiration-days}") int refreshTokenExpirationDays,
      GoogleAuthPort googleAuthPort,
      GoogleUserFactory googleUserFactory) {
    return new AuthServiceImpl(
        userRepo,
        tokenRepo,
        passwordEncoder,
        jwtService,
        tokenCleanup,
        refreshTokenExpirationDays,
        googleAuthPort,
        googleUserFactory);
  }

@Bean
PasswordResetUseCase passwordResetUseCase(
    UserRepository userRepo,
    RefreshTokenRepository refreshTokenRepo,
    PasswordResetTokenRepository resetTokenRepo,
    PasswordEncoder passwordEncoder,
    PasswordResetEmailPort emailPort,
    @Value("${app.frontend.url}") String frontendUrl,
    @Value("${app.password-reset.path}") String passwordResetPath,
    @Value("${app.mobile.deep-link.url}") String mobileDeepLinkUrl,
    @Value("${app.mobile.reset-path}") String mobileResetPath) {
  return new PasswordResetService(
      userRepo, refreshTokenRepo, resetTokenRepo, passwordEncoder, emailPort,
      frontendUrl, passwordResetPath, mobileDeepLinkUrl, mobileResetPath);
}

  @Bean
  UserUseCase userUseCase(
      UserRepository userRepo,
      UserFollowRepository followRepo,
      ProfileImagePort profileImagePort,
      RefreshTokenRepository tokenRepo,
      UserSearchPort searchPort,
      UserNotificationEventPort notificationEventPort) {
    return new CachedUserService(
        new UserService(
            userRepo, followRepo, profileImagePort, tokenRepo, searchPort, notificationEventPort));
  }
}
