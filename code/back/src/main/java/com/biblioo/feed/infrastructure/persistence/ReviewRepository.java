package com.biblioo.feed.infrastructure.persistence;

import com.biblioo.feed.domain.model.Review;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

  boolean existsByUserIdAndBookIdAndIsDeletedFalse(Long userId, Long bookId);

  Optional<Review> findByIdAndIsDeletedFalse(Long id);

  @Query(
      "SELECT r FROM Review r WHERE r.bookId = :bookId AND r.isDeleted = false ORDER BY r.createdAt DESC")
  Page<Review> findRecentReviewsByBookId(@Param("bookId") Long bookId, Pageable pageable);

  @Query(
      "SELECT r FROM Review r WHERE r.userId = :userId AND r.isDeleted = false ORDER BY r.createdAt DESC")
  Page<Review> findRecentReviewsByUserId(@Param("userId") Long userId, Pageable pageable);

  @Modifying
  @Query("UPDATE Review r SET r.isDeleted = true WHERE r.id = :reviewId AND r.userId = :userId")
  int softDeleteReview(@Param("reviewId") Long reviewId, @Param("userId") Long userId);

  @Modifying
  @Query("UPDATE Review r SET r.likeCount = r.likeCount + 1 WHERE r.id = :reviewId")
  void incrementLikeCount(@Param("reviewId") Long reviewId);

  @Modifying
  @Query(
      "UPDATE Review r SET r.likeCount = r.likeCount - 1 WHERE r.id = :reviewId AND r.likeCount > 0")
  void decrementLikeCount(@Param("reviewId") Long reviewId);

  // Atualização de contadores de comentário
  @Modifying
  @Query("UPDATE Review r SET r.commentCount = r.commentCount + 1 WHERE r.id = :reviewId")
  void incrementCommentCount(@Param("reviewId") Long reviewId);

  @Modifying
  @Query(
      "UPDATE Review r SET r.commentCount = r.commentCount - 1 WHERE r.id = :reviewId AND r.commentCount > 0")
  void decrementCommentCount(@Param("reviewId") Long reviewId);

  @Query(
      "SELECT AVG(r.rating) FROM Review r WHERE r.bookId = :bookId AND r.rating IS NOT NULL AND r.isDeleted = false")
  Double calculateAverageRating(@Param("bookId") Long bookId);

  @Query(
      "SELECT COUNT(r) FROM Review r WHERE r.bookId = :bookId AND r.rating IS NOT NULL AND r.isDeleted = false")
  long countRatings(@Param("bookId") Long bookId);

  @Query(
      "SELECT r FROM Review r WHERE r.userId IN :authorIds AND r.isDeleted = false"
          + " AND r.createdAt >= :since ORDER BY r.createdAt DESC")
  List<Review> findRecentByAuthorIds(
      @Param("authorIds") List<Long> authorIds,
      @Param("since") LocalDateTime since,
      org.springframework.data.domain.Pageable pageable);
}
