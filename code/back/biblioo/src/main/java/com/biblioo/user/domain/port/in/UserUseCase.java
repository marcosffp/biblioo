package com.biblioo.user.domain.port.in;

import com.biblioo.user.domain.model.User;

public interface UserUseCase {

  User getById(Long id);

  User getByUsername(String username);

  User updateProfile(Long userId, String bio, String avatarUrl, String bannerUrl);

  User updateVisibility(Long userId, boolean isPrivate);

  User uploadAvatar(Long userId, byte[] imageBytes);

  User uploadBanner(Long userId, byte[] imageBytes);

  void follow(Long followerId, Long followedId);

  void unfollow(Long followerId, Long followedId);

  boolean isFollowing(Long followerId, Long followedId);
}
