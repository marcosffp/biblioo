package com.biblioo.feed.domain.port.in;

import com.biblioo.feed.infrastructure.dto.feed.FeedSlice;

public interface FeedUseCase {

  FeedSlice getFeed(Long userId, String cursor, int size);

  long getNewItemsCount(Long userId, Long sinceScore);
}
