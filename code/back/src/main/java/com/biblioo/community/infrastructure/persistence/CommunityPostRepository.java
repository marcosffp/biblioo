package com.biblioo.community.infrastructure.persistence;

import com.biblioo.community.domain.model.CommunityPost;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CommunityPostRepository extends JpaRepository<CommunityPost, Long> {

  @Query("SELECT p FROM CommunityPost p WHERE p.id = :id AND p.isDeleted = false")
  Optional<CommunityPost> findActiveById(@Param("id") Long id);

  @Query(
      "SELECT p FROM CommunityPost p "
          + "WHERE p.communityId = :cid AND p.isDeleted = false "
          + "ORDER BY p.createdAt DESC")
  Page<CommunityPost> findByCommunityId(@Param("cid") Long communityId, Pageable pageable);

  @Modifying
  @Query("UPDATE CommunityPost p SET p.isDeleted = true WHERE p.id = :id")
  void softDelete(@Param("id") Long postId);

  @Modifying
  @Query("UPDATE CommunityPost p SET p.isDeleted = true WHERE p.communityId = :cid")
  void softDeleteAllByCommunityId(@Param("cid") Long communityId);

  @Modifying
  @Query("UPDATE CommunityPost p SET p.likeCount = p.likeCount + 1 WHERE p.id = :id")
  void incrementLikeCount(@Param("id") Long postId);

  @Modifying
  @Query(
      "UPDATE CommunityPost p SET p.likeCount = p.likeCount - 1 "
          + "WHERE p.id = :id AND p.likeCount > 0")
  void decrementLikeCount(@Param("id") Long postId);

  @Modifying
  @Query("UPDATE CommunityPost p SET p.commentCount = p.commentCount + 1 WHERE p.id = :id")
  void incrementCommentCount(@Param("id") Long postId);

  @Modifying
  @Query(
      "UPDATE CommunityPost p SET p.commentCount = p.commentCount - 1 "
          + "WHERE p.id = :id AND p.commentCount > 0")
  void decrementCommentCount(@Param("id") Long postId);
}
