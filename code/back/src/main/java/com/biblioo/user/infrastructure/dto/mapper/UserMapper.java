package com.biblioo.user.infrastructure.dto.mapper;

import com.biblioo.user.domain.model.User;
import com.biblioo.user.infrastructure.dto.UserProfileResponse;
import com.biblioo.user.infrastructure.dto.UserSummaryResponse;

public class UserMapper {

  private UserMapper() {}

  public static UserSummaryResponse toSummary(User user) {
    return new UserSummaryResponse(
        user.getId(), user.getUsername(), user.getAvatarUrl(), user.getBannerUrl());
  }

  public static UserProfileResponse toResponse(User user) {
    return new UserProfileResponse(
        user.getId(),
        user.getUsername(),
        user.getEmail(),
        user.getBio(),
        user.getAvatarUrl(),
        user.getBannerUrl(),
        user.isPrivate(),
        false,
        user.getCreatedAt() != null ? user.getCreatedAt().toString() : null);
  }

  /** Perfil restrito: identificação visual completa, bio e email ocultados. */
  public static UserProfileResponse toRestrictedResponse(User user) {
    return new UserProfileResponse(
        user.getId(),
        user.getUsername(),
        null,
        null,
        user.getAvatarUrl(),
        user.getBannerUrl(),
        true,
        true,
        null);
  }
}
