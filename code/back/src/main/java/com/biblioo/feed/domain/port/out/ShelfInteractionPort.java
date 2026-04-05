package com.biblioo.feed.domain.port.out;

public interface ShelfInteractionPort {

  void ensureBookReadStatusIsCompleted(Long userId, Long bookId);
}
