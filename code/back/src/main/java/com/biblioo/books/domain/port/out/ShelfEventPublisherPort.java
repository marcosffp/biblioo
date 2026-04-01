package com.biblioo.books.domain.port.out;

public interface ShelfEventPublisherPort {

  void publishReaderCountIncrement(Long bookId);

  void publishReaderCountDecrement(Long bookId);

  void publishBookReviewStatsUpdated(Long bookId);
}
