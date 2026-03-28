package com.biblioo.user.infrastructure.persistence;

import com.biblioo.user.domain.model.UserFollow;
import com.biblioo.user.domain.model.UserFollowId;
import com.biblioo.user.domain.port.out.UserFollowRepositoryPort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface UserFollowRepository
    extends JpaRepository<UserFollow, UserFollowId>, UserFollowRepositoryPort {

  @Query(
      "SELECT COUNT(f) > 0 FROM UserFollow f"
          + " WHERE f.followerId = :followerId AND f.followedId = :followedId")
  boolean existsFollow(
      @Param("followerId") Long followerId, @Param("followedId") Long followedId);

  @Modifying
  @Transactional
  @Query(
      "DELETE FROM UserFollow f"
          + " WHERE f.followerId = :followerId AND f.followedId = :followedId")
  void deleteFollow(
      @Param("followerId") Long followerId, @Param("followedId") Long followedId);

  @Override
  default void follow(Long followerId, Long followedId) {
    save(new UserFollow(followerId, followedId));
  }

  @Override
  default void unfollow(Long followerId, Long followedId) {
    deleteFollow(followerId, followedId);
  }

  @Override
  default boolean isFollowing(Long followerId, Long followedId) {
    return existsFollow(followerId, followedId);
  }
}
