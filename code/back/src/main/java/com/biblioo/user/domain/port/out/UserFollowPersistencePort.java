package com.biblioo.user.domain.port.out;

import com.biblioo.user.domain.model.FollowStatus;
import com.biblioo.user.domain.model.User;
import java.util.List;
import java.util.Optional;

public interface UserFollowPersistencePort {

  boolean isFollowing(Long followerId, Long followedId);

  Optional<FollowStatus> findFollowStatus(Long followerId, Long followedId);

  void follow(Long followerId, Long followedId, FollowStatus status);

  void unfollow(Long followerId, Long followedId);

  void acceptFollow(Long requesterId, Long userId);

  List<User> findPendingRequests(Long userId, int page, int size);

  List<User> findFollowers(Long userId, int page, int size);

  List<User> findFollowing(Long userId, int page, int size);

  void deleteAllByUserId(Long userId);
}