package com.biblioo.user.domain.port.out;

public interface UserFollowRepositoryPort {

  void follow(Long followerId, Long followedId);

  void unfollow(Long followerId, Long followedId);

  boolean isFollowing(Long followerId, Long followedId);
}
