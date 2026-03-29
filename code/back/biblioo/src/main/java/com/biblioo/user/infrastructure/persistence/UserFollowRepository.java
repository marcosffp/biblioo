package com.biblioo.user.infrastructure.persistence;

import com.biblioo.user.domain.model.User;
import com.biblioo.user.domain.model.UserFollow;
import com.biblioo.user.domain.model.UserFollowId;
import com.biblioo.user.domain.port.out.UserFollowRepositoryPort;
import java.util.List;
import org.springframework.data.domain.PageRequest;
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
  boolean existsFollow(@Param("followerId") Long followerId, @Param("followedId") Long followedId);

  @Modifying
  @Transactional
  @Query(
      "DELETE FROM UserFollow f"
          + " WHERE f.followerId = :followerId AND f.followedId = :followedId")
  void deleteFollow(@Param("followerId") Long followerId, @Param("followedId") Long followedId);

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

  @Query(
      "SELECT u FROM User u WHERE u.id IN "
          + "(SELECT f.followerId FROM UserFollow f WHERE f.followedId = :userId)")
  List<User> findFollowerUsers(@Param("userId") Long userId, PageRequest pageable);

  @Query(
      "SELECT u FROM User u WHERE u.id IN "
          + "(SELECT f.followedId FROM UserFollow f WHERE f.followerId = :userId)")
  List<User> findFollowingUsers(@Param("userId") Long userId, PageRequest pageable);

  @Modifying
  @Transactional
  @Query("DELETE FROM UserFollow f WHERE f.followerId = :userId OR f.followedId = :userId")
  void deleteAllByUserIdQuery(@Param("userId") Long userId);

  @Override
  default List<User> findFollowers(Long userId, int page, int size) {
    return findFollowerUsers(userId, PageRequest.of(page, size));
  }

  @Override
  default List<User> findFollowing(Long userId, int page, int size) {
    return findFollowingUsers(userId, PageRequest.of(page, size));
  }

  @Override
  default void deleteAllByUser(Long userId) {
    deleteAllByUserIdQuery(userId);
  }
}
