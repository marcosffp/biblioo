package com.biblioo.user.infrastructure.persistence;

import com.biblioo.user.domain.model.FollowStatus;
import com.biblioo.user.domain.model.User;
import com.biblioo.user.domain.port.out.UserFollowPersistencePort;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserFollowPersistenceAdapter implements UserFollowPersistencePort {

  private final UserFollowRepository userFollowRepository;

  @Override
  public boolean isFollowing(Long followerId, Long followedId) {
    return userFollowRepository.isFollowing(followerId, followedId);
  }

  @Override
  public Optional<FollowStatus> findFollowStatus(Long followerId, Long followedId) {
    return userFollowRepository.findFollowStatus(followerId, followedId);
  }

  @Override
  public void follow(Long followerId, Long followedId, FollowStatus status) {
    userFollowRepository.follow(followerId, followedId, status);
  }

  @Override
  public void unfollow(Long followerId, Long followedId) {
    userFollowRepository.unfollow(followerId, followedId);
  }

  @Override
  public void acceptFollow(Long requesterId, Long userId) {
    userFollowRepository.acceptFollow(requesterId, userId);
  }

  @Override
  public List<User> findPendingRequests(Long userId, int page, int size) {
    return userFollowRepository.findPendingRequests(userId, page, size);
  }

  @Override
  public List<User> findFollowers(Long userId, int page, int size) {
    return userFollowRepository.findFollowers(userId, page, size);
  }

  @Override
  public List<User> findFollowing(Long userId, int page, int size) {
    return userFollowRepository.findFollowing(userId, page, size);
  }

  @Override
  public void deleteAllByUserId(Long userId) {
    userFollowRepository.deleteAllByUserId(userId);
  }
}
