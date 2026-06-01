package com.biblioo.feed.domain.port.in;

import com.biblioo.feed.domain.model.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReviewUseCase {
  Review createReview(Long userId, Long bookId, Integer rating, String text);

  Review updateReview(Long userId, Long reviewId, Integer rating, String text);

  void deleteReview(Long userId, Long reviewId);

  boolean likeReview(Long userId, Long reviewId);

  Review getReviewById(Long reviewId);

  Page<Review> getRecentReviewsByUserId(Long userId, Pageable pageable);
}
