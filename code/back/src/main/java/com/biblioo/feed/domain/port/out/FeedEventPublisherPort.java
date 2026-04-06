package com.biblioo.feed.domain.port.out;

public interface FeedEventPublisherPort {
  void publishBookReviewStatsUpdated(Long bookId, Integer oldRating, Integer newRating);
}
