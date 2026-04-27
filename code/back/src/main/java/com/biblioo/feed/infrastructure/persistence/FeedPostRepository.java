package com.biblioo.feed.infrastructure.persistence;

import com.biblioo.feed.domain.model.FeedPost;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface FeedPostRepository extends JpaRepository<FeedPost, Long> {

  Optional<FeedPost> findByIdAndIsDeletedFalse(Long id);

  @Query(
      "SELECT p FROM FeedPost p WHERE p.userId = :userId AND p.isDeleted = false ORDER BY p.createdAt DESC")
  Page<FeedPost> findRecentByUserId(@Param("userId") Long userId, Pageable pageable);

  @Modifying
  @Query("UPDATE FeedPost p SET p.isDeleted = true WHERE p.id = :postId AND p.userId = :userId")
  int softDeletePost(@Param("postId") Long postId, @Param("userId") Long userId);

  @Modifying
  @Query("UPDATE FeedPost p SET p.likeCount = p.likeCount + 1 WHERE p.id = :postId")
  void incrementLikeCount(@Param("postId") Long postId);

  @Modifying
  @Query(
      "UPDATE FeedPost p SET p.likeCount = p.likeCount - 1 WHERE p.id = :postId AND p.likeCount > 0")
  void decrementLikeCount(@Param("postId") Long postId);

  @Modifying
  @Query("UPDATE FeedPost p SET p.commentCount = p.commentCount + 1 WHERE p.id = :postId")
  void incrementCommentCount(@Param("postId") Long postId);

  @Modifying
  @Query(
      "UPDATE FeedPost p SET p.commentCount = p.commentCount - 1 WHERE p.id = :postId AND p.commentCount > 0")
  void decrementCommentCount(@Param("postId") Long postId);
}
