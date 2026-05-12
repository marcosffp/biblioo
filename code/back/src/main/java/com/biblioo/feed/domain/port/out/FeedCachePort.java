package com.biblioo.feed.domain.port.out;

import com.biblioo.feed.domain.model.FeedItem;
import java.util.List;

public interface FeedCachePort {

  List<FeedItem> getCachedPage(Long userId, String cursor, int size);

  boolean isCacheWarm(Long userId);

  void populate(Long userId, List<FeedItem> items);

  void addIfActive(Long userId, FeedItem item);

  long countNewItems(Long userId, long sinceScore);

  long countRemaining(Long userId, String cursor);

  void evict(Long userId);
}
