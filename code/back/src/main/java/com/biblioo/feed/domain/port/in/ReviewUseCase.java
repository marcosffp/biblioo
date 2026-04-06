package com.biblioo.feed.domain.port.in;

import com.biblioo.feed.domain.model.Review;
import java.util.List;

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

  void likeReview(Long userId, Long reviewId);
}
