package com.biblioo.user.infrastructure.cache;

import com.biblioo.user.domain.model.FollowStatus;
import com.biblioo.user.domain.model.ProfileAccess;
import com.biblioo.user.domain.model.User;
import com.biblioo.user.domain.port.in.UserUseCase;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
public class CachedUserService implements UserUseCase {

  private final UserUseCase delegate;

  @Override
  @Cacheable(value = "user-profile", key = "#result.id", condition = "#result != null")
  public User getByUsername(String username) {
    return delegate.getByUsername(username);
  }

  @Override
  @Cacheable(value = "user-profile", key = "#id")
  public User getById(Long id) {
    return delegate.getById(id);
  }

  @Override
  @CachePut(value = "user-profile", key = "#userId")
  public User updateProfile(
      Long userId, String username, String bio, String avatarUrl, String bannerUrl) {
    return delegate.updateProfile(userId, username, bio, avatarUrl, bannerUrl);
  }

  @Override
  @CachePut(value = "user-profile", key = "#userId")
  public User updateVisibility(Long userId, boolean isPrivate) {
    return delegate.updateVisibility(userId, isPrivate);
  }

  @Override
  @CachePut(value = "user-profile", key = "#userId")
  public User uploadAvatar(Long userId, byte[] imageBytes) {
    return delegate.uploadAvatar(userId, imageBytes);
  }

  @Override
  @CachePut(value = "user-profile", key = "#userId")
  public User uploadBanner(Long userId, byte[] imageBytes) {
    return delegate.uploadBanner(userId, imageBytes);
  }

  @Override
  @Transactional
  public FollowStatus follow(Long followerId, Long followedId) {
    return delegate.follow(followerId, followedId);
  }

  @Override
  @Transactional
  public void unfollow(Long followerId, Long followedId) {
    delegate.unfollow(followerId, followedId);
  }

  @Override
  public boolean isFollowing(Long followerId, Long followedId) {
    return delegate.isFollowing(followerId, followedId);
  }

  @Override
  @Transactional
  public void acceptFollowRequest(Long userId, Long requesterId) {
    delegate.acceptFollowRequest(userId, requesterId);
  }

  @Override
  @Transactional
  public void rejectFollowRequest(Long userId, Long requesterId) {
    delegate.rejectFollowRequest(userId, requesterId);
  }

  @Override
  public List<User> getPendingFollowRequests(Long userId, int page, int size) {
    return delegate.getPendingFollowRequests(userId, page, size);
  }

  @Override
  @CacheEvict(value = "user-profile", key = "#userId")
  public void deleteAccount(Long userId) {
    delegate.deleteAccount(userId);
  }

  @Override
  public ProfileAccess getProfile(Long viewerId, String username) {
    return delegate.getProfile(viewerId, username);
  }

  @Override
  public List<User> getFollowers(Long userId, int page, int size) {
    return delegate.getFollowers(userId, page, size);
  }

  @Override
  public List<User> getFollowing(Long userId, int page, int size) {
    return delegate.getFollowing(userId, page, size);
  }

  @Override
  public List<User> searchUsers(String term, int page, int size) {
    return delegate.searchUsers(term, page, size);
  }
}
