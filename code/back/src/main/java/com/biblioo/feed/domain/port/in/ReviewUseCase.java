package com.biblioo.feed.domain.port.in;

import com.biblioo.feed.domain.model.Review;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReviewUseCase {
  Review createReview(
      Long userId, Long bookId, Integer rating, String text, List<byte[]> newImages, byte[] gif);

  Review updateReview(
      Long userId,
      Long reviewId,
      Integer rating,
      String text,
      List<byte[]> newImages,
      List<String> imagesToDeleteUrls,
      byte[] gif);

  void deleteReview(Long userId, Long reviewId);

  boolean likeReview(Long userId, Long reviewId);

  Review getReviewById(Long reviewId);

  Page<Review> getRecentReviewsByUserId(Long userId, Pageable pageable);
}
