package com.biblioo.feed.infrastructure.persistence;

import com.biblioo.feed.domain.model.Like;
import java.util.Collection;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {

  boolean existsByContentIdAndUserId(Long contentId, Long userId);

  @Query("SELECT l.contentId FROM Like l WHERE l.contentId IN :contentIds AND l.userId = :userId")
  Set<Long> findLikedContentIds(
      @Param("contentIds") Collection<Long> contentIds, @Param("userId") Long userId);

  @Modifying
  @Query("DELETE FROM Like l WHERE l.contentId = :contentId AND l.userId = :userId")
  int deleteByContentIdAndUserId(@Param("contentId") Long contentId, @Param("userId") Long userId);

  @Modifying
  @Query(
      value =
          "INSERT IGNORE INTO likes (content_id, user_id, type, created_at)"
              + " VALUES (:contentId, :userId, :type, NOW())",
      nativeQuery = true)
  int insertIgnore(
      @Param("contentId") Long contentId, @Param("userId") Long userId, @Param("type") String type);
}
