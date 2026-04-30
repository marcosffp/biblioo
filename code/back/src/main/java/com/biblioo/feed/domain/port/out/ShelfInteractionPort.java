package com.biblioo.feed.domain.port.out;

public interface ShelfInteractionPort {

  boolean containsBook(Long userId, Long bookId);
}
