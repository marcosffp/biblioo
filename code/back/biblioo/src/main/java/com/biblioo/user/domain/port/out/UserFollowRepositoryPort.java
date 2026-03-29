package com.biblioo.user.domain.port.out;

import com.biblioo.user.domain.model.User;
import java.util.List;

public interface UserFollowRepositoryPort {

  void follow(Long followerId, Long followedId);

  void unfollow(Long followerId, Long followedId);

  boolean isFollowing(Long followerId, Long followedId);

  List<User> findFollowers(Long userId, int page, int size);

  List<User> findFollowing(Long userId, int page, int size);

  void deleteAllByUser(Long userId);
}
