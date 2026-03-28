package com.biblioo.user.infrastructure.cache;

import com.biblioo.user.domain.model.User;
import com.biblioo.user.domain.port.in.UserUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;

/**
 * Decorator de cache sobre UserService. Criado como @Bean em UserConfig para que o Spring aplique
 * os proxies de @Cacheable/@CachePut corretamente.
 */
@RequiredArgsConstructor
public class CachedUserService implements UserUseCase {

  private final UserUseCase delegate;

  @Override
  @Cacheable(value = "user-profile", key = "#username")
  public User getByUsername(String username) {
    return delegate.getByUsername(username);
  }

  @Override
  @Cacheable(value = "user-profile-by-id", key = "#id")
  public User getById(Long id) {
    return delegate.getById(id);
  }

  @Override
  @CachePut(value = "user-profile", key = "#result.username")
  public User updateProfile(Long userId, String bio, String avatarUrl, String bannerUrl) {
    return delegate.updateProfile(userId, bio, avatarUrl, bannerUrl);
  }

  @Override
  @CachePut(value = "user-profile", key = "#result.username")
  public User updateVisibility(Long userId, boolean isPrivate) {
    return delegate.updateVisibility(userId, isPrivate);
  }

  @Override
  @CachePut(value = "user-profile", key = "#result.username")
  public User uploadAvatar(Long userId, byte[] imageBytes) {
    return delegate.uploadAvatar(userId, imageBytes);
  }

  @Override
  @CachePut(value = "user-profile", key = "#result.username")
  public User uploadBanner(Long userId, byte[] imageBytes) {
    return delegate.uploadBanner(userId, imageBytes);
  }

  @Override
  public void follow(Long followerId, Long followedId) {
    delegate.follow(followerId, followedId);
  }

  @Override
  public void unfollow(Long followerId, Long followedId) {
    delegate.unfollow(followerId, followedId);
  }

  @Override
  public boolean isFollowing(Long followerId, Long followedId) {
    return delegate.isFollowing(followerId, followedId);
  }
}
