package com.biblioo.feed.infrastructure.persistence;

import com.biblioo.feed.domain.model.FeedItem;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface FeedItemRepository extends JpaRepository<FeedItem, Long> {

  @Query("SELECT f FROM FeedItem f WHERE f.userId = :userId ORDER BY f.score DESC, f.id DESC")
  List<FeedItem> findTopByUserIdOrderByScoreDesc(@Param("userId") Long userId, Pageable pageable);

  @Query(
      "SELECT f FROM FeedItem f WHERE f.userId = :userId AND f.score < :score ORDER BY f.score DESC, f.id DESC")
  List<FeedItem> findByUserIdAndScoreLessThanOrderByScoreDesc(
      @Param("userId") Long userId, @Param("score") long score, Pageable pageable);

  long countByUserIdAndScoreGreaterThan(@Param("userId") Long userId, @Param("score") long score);

  @Modifying
  @Transactional
  @Query(
      value =
          "INSERT IGNORE INTO feed_items (user_id, content_id, content_type, author_id, score, created_at)"
              + " VALUES (:userId, :contentId, :contentType, :authorId, :score, :createdAt)",
      nativeQuery = true)
  void insertIgnore(
      @Param("userId") Long userId,
      @Param("contentId") Long contentId,
      @Param("contentType") String contentType,
      @Param("authorId") Long authorId,
      @Param("score") long score,
      @Param("createdAt") LocalDateTime createdAt);
}
