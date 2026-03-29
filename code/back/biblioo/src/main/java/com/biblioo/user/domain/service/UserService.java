package com.biblioo.user.domain.service;

import com.biblioo.user.domain.exception.AlreadyFollowingException;
import com.biblioo.user.domain.exception.UserNotFoundException;
import com.biblioo.user.domain.model.ProfileAccess;
import com.biblioo.user.domain.model.User;
import com.biblioo.user.domain.port.in.UserUseCase;
import com.biblioo.user.domain.port.out.ProfileImagePort;
import com.biblioo.user.domain.port.out.RefreshTokenRepositoryPort;
import com.biblioo.user.domain.port.out.UserFollowRepositoryPort;
import com.biblioo.user.domain.port.out.UserRepositoryPort;
import com.biblioo.user.domain.port.out.UserSearchPort;
import java.util.List;

public class UserService implements UserUseCase {

  private final UserRepositoryPort userRepo;
  private final UserFollowRepositoryPort followRepo;
  private final ProfileImagePort profileImagePort;
  private final RefreshTokenRepositoryPort tokenRepo;
  private final UserSearchPort searchPort;

  public UserService(
      UserRepositoryPort userRepo,
      UserFollowRepositoryPort followRepo,
      ProfileImagePort profileImagePort,
      RefreshTokenRepositoryPort tokenRepo,
      UserSearchPort searchPort) {
    this.userRepo = userRepo;
    this.followRepo = followRepo;
    this.profileImagePort = profileImagePort;
    this.tokenRepo = tokenRepo;
    this.searchPort = searchPort;
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
  public ProfileAccess getProfile(Long viewerId, String username) {
    User target =
        userRepo.findByUsername(username).orElseThrow(() -> new UserNotFoundException(username));

    if (!target.isPrivate()) {
      return new ProfileAccess(target, false);
    }

    boolean allowed =
        viewerId != null
            && (viewerId.equals(target.getId())
                || followRepo.isFollowing(viewerId, target.getId()));

    return new ProfileAccess(target, !allowed);
  }

  @Override
  public User updateProfile(Long userId, String bio, String avatarUrl, String bannerUrl) {
    User user = userRepo.findById(userId).orElseThrow(() -> new UserNotFoundException(userId));
    if (bio != null) user.setBio(bio);
    if (avatarUrl != null) user.setAvatarUrl(avatarUrl);
    if (bannerUrl != null) user.setBannerUrl(bannerUrl);
    User saved = userRepo.save(user);
    searchPort.index(saved);
    return saved;
  }

  @Override
  public User updateVisibility(Long userId, boolean isPrivate) {
    User user = userRepo.findById(userId).orElseThrow(() -> new UserNotFoundException(userId));
    user.setPrivate(isPrivate);
    return userRepo.save(user);
  }

  @Override
  public User uploadAvatar(Long userId, byte[] imageBytes) {
    String url = profileImagePort.uploadProfileImage(imageBytes, userId.toString()).join();
    User user = userRepo.findById(userId).orElseThrow(() -> new UserNotFoundException(userId));
    user.setAvatarUrl(url);
    User saved = userRepo.save(user);
    searchPort.index(saved);
    return saved;
  }

  @Override
  public User uploadBanner(Long userId, byte[] imageBytes) {
    String url = profileImagePort.uploadBannerImage(imageBytes, userId.toString()).join();
    User user = userRepo.findById(userId).orElseThrow(() -> new UserNotFoundException(userId));
    user.setBannerUrl(url);
    User saved = userRepo.save(user);
    searchPort.index(saved);
    return saved;
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

  @Override
  public void deleteAccount(Long userId) {
    userRepo.findById(userId).orElseThrow(() -> new UserNotFoundException(userId));
    tokenRepo.deleteAllByUserId(userId);
    followRepo.deleteAllByUser(userId);
    userRepo.deleteById(userId);
    searchPort.deleteFromIndex(userId);
  }

  @Override
  public List<User> getFollowers(Long userId, int page, int size) {
    return followRepo.findFollowers(userId, page, size);
  }

  @Override
  public List<User> getFollowing(Long userId, int page, int size) {
    return followRepo.findFollowing(userId, page, size);
  }

  @Override
  public List<User> searchUsers(String term, int page, int size) {
    if (term == null || term.isBlank() || term.length() < 2) return List.of();
    return searchPort.search(term, page, size);
  }
}
