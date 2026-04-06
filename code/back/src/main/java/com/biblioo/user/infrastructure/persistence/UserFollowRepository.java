package com.biblioo.user.infrastructure.persistence;

import com.biblioo.user.domain.model.User;
import com.biblioo.user.domain.model.UserFollow;
import com.biblioo.user.domain.model.UserFollowId;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface UserFollowRepository extends JpaRepository<UserFollow, UserFollowId> {

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

  /** Retorna os usuários que seguem :userId. JOIN via subquery para usar o índice em followedId. */
  @Query(
      "SELECT u FROM User u WHERE u.id IN"
          + " (SELECT f.followerId FROM UserFollow f WHERE f.followedId = :userId)")
  List<User> findFollowerUsers(@Param("userId") Long userId, PageRequest pageable);

  /** Retorna os usuários que :userId segue. JOIN via subquery para usar o índice em followerId. */
  @Query(
      "SELECT u FROM User u WHERE u.id IN"
          + " (SELECT f.followedId FROM UserFollow f WHERE f.followerId = :userId)")
  List<User> findFollowingUsers(@Param("userId") Long userId, PageRequest pageable);

  @Modifying
  @Transactional
  @Query("DELETE FROM UserFollow f WHERE f.followerId = :userId OR f.followedId = :userId")
  void deleteAllByUserId(@Param("userId") Long userId);

  default void follow(Long followerId, Long followedId) {
    save(new UserFollow(followerId, followedId));
  }

  default void unfollow(Long followerId, Long followedId) {
    deleteFollow(followerId, followedId);
  }

  default boolean isFollowing(Long followerId, Long followedId) {
    return existsFollow(followerId, followedId);
  }

  default List<User> findFollowers(Long userId, int page, int size) {
    return findFollowerUsers(userId, PageRequest.of(page, size));
  }

  default List<User> findFollowing(Long userId, int page, int size) {
    return findFollowingUsers(userId, PageRequest.of(page, size));
  }
}
