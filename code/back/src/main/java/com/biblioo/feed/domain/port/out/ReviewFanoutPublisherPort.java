package com.biblioo.feed.domain.port.out;

public interface ReviewFanoutPublisherPort {

  void publishReviewCreated(Long reviewId, Long authorId, long createdAtEpochMilli);
}
