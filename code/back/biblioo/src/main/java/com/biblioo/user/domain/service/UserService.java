package com.biblioo.user.domain.service;

import com.biblioo.user.domain.exception.AlreadyFollowingException;
import com.biblioo.user.domain.exception.UserNotFoundException;
import com.biblioo.user.domain.model.User;
import com.biblioo.user.domain.port.in.UserUseCase;
import com.biblioo.user.domain.port.out.ProfileImagePort;
import com.biblioo.user.domain.port.out.UserFollowRepositoryPort;
import com.biblioo.user.domain.port.out.UserRepositoryPort;

public class UserService implements UserUseCase {

  private final UserRepositoryPort userRepo;
  private final UserFollowRepositoryPort followRepo;
  private final ProfileImagePort profileImagePort;

  public UserService(
      UserRepositoryPort userRepo,
      UserFollowRepositoryPort followRepo,
      ProfileImagePort profileImagePort) {
    this.userRepo = userRepo;
    this.followRepo = followRepo;
    this.profileImagePort = profileImagePort;
  }

  @Override
  public User getById(Long id) {
    return userRepo.findById(id).orElseThrow(() -> new UserNotFoundException(id));
  }

  @Override
  public User getByUsername(String username) {
    return userRepo.findByUsername(username).orElseThrow(() -> new UserNotFoundException(username));
  }

  @Override
  public User updateProfile(Long userId, String bio, String avatarUrl, String bannerUrl) {
    User user = userRepo.findById(userId).orElseThrow(() -> new UserNotFoundException(userId));
    if (bio != null) user.setBio(bio);
    if (avatarUrl != null) user.setAvatarUrl(avatarUrl);
    if (bannerUrl != null) user.setBannerUrl(bannerUrl);
    return userRepo.save(user);
  }

  @Override
  public User updateVisibility(Long userId, boolean isPrivate) {
    User user = userRepo.findById(userId).orElseThrow(() -> new UserNotFoundException(userId));
    user.setPrivate(isPrivate);
    return userRepo.save(user);
  }

  @Override
  public User uploadAvatar(Long userId, byte[] imageBytes) {
    // Upload assíncrono no userTaskExecutor; join() aguarda o resultado antes de persistir
    String url = profileImagePort.uploadProfileImage(imageBytes, userId.toString()).join();
    User user = userRepo.findById(userId).orElseThrow(() -> new UserNotFoundException(userId));
    user.setAvatarUrl(url);
    return userRepo.save(user);
  }

  @Override
  public User uploadBanner(Long userId, byte[] imageBytes) {
    String url = profileImagePort.uploadBannerImage(imageBytes, userId.toString()).join();
    User user = userRepo.findById(userId).orElseThrow(() -> new UserNotFoundException(userId));
    user.setBannerUrl(url);
    return userRepo.save(user);
  }

  @Override
  public void follow(Long followerId, Long followedId) {
    if (followerId.equals(followedId)) {
      throw new IllegalArgumentException("You cannot follow yourself");
    }
    userRepo.findById(followedId).orElseThrow(() -> new UserNotFoundException(followedId));
    if (followRepo.isFollowing(followerId, followedId)) {
      throw new AlreadyFollowingException();
    }
    followRepo.follow(followerId, followedId);
  }

  @Override
  public void unfollow(Long followerId, Long followedId) {
    followRepo.unfollow(followerId, followedId);
  }

  @Override
  public boolean isFollowing(Long followerId, Long followedId) {
    return followRepo.isFollowing(followerId, followedId);
  }
}
