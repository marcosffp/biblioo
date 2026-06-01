package com.biblioo.feed.domain.port.in;

import java.time.LocalDateTime;
import java.util.List;

public interface UserReviewsUseCase {

  record ReviewRecord(Long reviewId, Long bookId, Integer rating, LocalDateTime updatedAt) {}

  List<ReviewRecord> getReviewsByUserId(Long userId);
}
