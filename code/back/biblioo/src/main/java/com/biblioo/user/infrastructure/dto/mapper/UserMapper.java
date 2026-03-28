package com.biblioo.user.infrastructure.dto.mapper;

import com.biblioo.user.domain.model.User;
import com.biblioo.user.infrastructure.dto.UserProfileResponse;

public class UserMapper {

  private UserMapper() {}

  public static UserProfileResponse toResponse(User user) {
    return new UserProfileResponse(
        user.getId(),
        user.getUsername(),
        user.getEmail(),
        user.getBio(),
        user.getAvatarUrl(),
        user.getBannerUrl(),
        user.isPrivate(),
        user.getCreatedAt() != null ? user.getCreatedAt().toString() : null);
  }
}
