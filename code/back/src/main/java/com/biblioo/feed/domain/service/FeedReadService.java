package com.biblioo.feed.domain.service;

import com.biblioo.feed.domain.model.FeedItem;
import com.biblioo.feed.domain.model.FeedSlice;
import com.biblioo.feed.domain.port.in.FeedUseCase;
import com.biblioo.feed.domain.port.out.FeedCachePort;
import com.biblioo.feed.domain.port.out.FollowerQueryPort;
import com.biblioo.feed.infrastructure.persistence.FeedItemRepository;
import com.biblioo.feed.infrastructure.persistence.ReviewRepository;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class FeedReadService implements FeedUseCase {

  private final FeedItemRepository feedItemRepository;
  private final ReviewRepository reviewRepository;
  private final FollowerQueryPort followerQueryPort;
  private final FeedCachePort feedCachePort;

  @Value("${feed.fanout.write-threshold:10000}")
  private long fanoutWriteThreshold;

  @Value("${feed.cache.warm-size:200}")
  private int warmSize;

  @Value("${feed.cache.sliding-window-threshold:0.7}")
  private double slidingWindowThreshold;

  @Override
  @Transactional(readOnly = true)
  public FeedSlice getFeed(Long userId, String cursor, int size) {
    if (feedCachePort.isCacheWarm(userId)) {
      List<FeedItem> cached = feedCachePort.getCachedPage(userId, cursor, size);
      if (!cached.isEmpty()) {
        triggerSlidingWindowIfNeeded(userId, cursor, size);
        return buildSlice(cached, size);
      }
    }

    return warmAndFetch(userId, cursor, size);
  }

  @Override
  @Transactional(readOnly = true)
  public long getNewItemsCount(Long userId, Long sinceScore) {
    if (feedCachePort.isCacheWarm(userId)) {
      return feedCachePort.countNewItems(userId, sinceScore);
    }
    return feedItemRepository.countByUserIdAndScoreGreaterThan(userId, sinceScore);
  }

  private FeedSlice warmAndFetch(Long userId, String cursor, int size) {
    List<FeedItem> allItems = loadFromDb(userId);
    if (!allItems.isEmpty()) {
      feedCachePort.populate(userId, allItems);
    }
    List<FeedItem> page = feedCachePort.getCachedPage(userId, cursor, size);
    triggerSlidingWindowIfNeeded(userId, cursor, size);
    return buildSlice(page, size);
  }

  private List<FeedItem> loadFromDb(Long userId) {
    // Itens do fan-out on write (autores abaixo do threshold)
    List<FeedItem> writeItems =
        feedItemRepository.findTopByUserIdOrderByScoreDesc(userId, PageRequest.of(0, warmSize));

    // Itens do fan-out on read (autores acima do threshold)
    List<Long> highVolumeAuthorIds =
        followerQueryPort.findFollowingHighVolumeAuthorIds(userId, fanoutWriteThreshold);

    List<FeedItem> readItems = new ArrayList<>();
    if (!highVolumeAuthorIds.isEmpty()) {
      LocalDateTime cutoff = LocalDateTime.now().minusDays(30);
      readItems =
          reviewRepository
              .findRecentByAuthorIds(
                  highVolumeAuthorIds, cutoff, PageRequest.of(0, warmSize / 2))
              .stream()
              .map(
                  r ->
                      FeedItem.builder()
                          .userId(userId)
                          .contentId(r.getId())
                          .contentType("REVIEW")
                          .authorId(r.getUserId())
                          .score(r.getCreatedAt().toInstant(ZoneOffset.UTC).toEpochMilli())
                          .createdAt(r.getCreatedAt())
                          .build())
              .toList();
    }

    List<FeedItem> merged = new ArrayList<>(writeItems);
    merged.addAll(readItems);
    merged.sort(Comparator.comparingLong(FeedItem::getScore).reversed());
    return merged.stream().limit(warmSize).toList();
  }

  private FeedSlice buildSlice(List<FeedItem> page, int size) {
    boolean hasMore = page.size() >= size;
    String nextCursor = null;
    if (hasMore && !page.isEmpty()) {
      FeedItem last = page.get(page.size() - 1);
      nextCursor = last.getScore() + "_" + last.getContentId();
    }
    return new FeedSlice(page, nextCursor, hasMore);
  }

  @Async("feedExecutor")
  void triggerSlidingWindowIfNeeded(Long userId, String cursor, int size) {
    try {
      long remaining = feedCachePort.countRemaining(userId, cursor);
      if (remaining < (long) (size * slidingWindowThreshold)) {
        log.debug("Sliding window: pré-carregando feed para userId={}", userId);
        List<FeedItem> more = loadFromDb(userId);
        if (!more.isEmpty()) {
          feedCachePort.populate(userId, more);
        }
      }
    } catch (Exception ex) {
      log.warn("Falha no sliding window pre-load para userId={}: {}", userId, ex.getMessage());
    }
  }
}
