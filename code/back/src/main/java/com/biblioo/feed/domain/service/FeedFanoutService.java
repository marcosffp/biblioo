package com.biblioo.feed.domain.service;

import com.biblioo.feed.domain.model.FanoutStatus;
import com.biblioo.feed.domain.model.FeedFanoutProgress;
import com.biblioo.feed.domain.model.FeedItem;
import com.biblioo.feed.domain.port.out.FeedCachePort;
import com.biblioo.feed.domain.port.out.FollowerQueryPort;
import com.biblioo.feed.infrastructure.persistence.FeedFanoutProgressRepository;
import com.biblioo.feed.infrastructure.persistence.FeedItemRepository;
import com.biblioo.feed.infrastructure.persistence.ReviewRepository;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class FeedFanoutService {

  private final FeedItemRepository feedItemRepository;
  private final FeedFanoutProgressRepository progressRepository;
  private final ReviewRepository reviewRepository;
  private final FollowerQueryPort followerQueryPort;
  private final FeedCachePort feedCachePort;

  @Value("${feed.fanout.write-threshold:10000}")
  private long fanoutWriteThreshold;

  @Value("${feed.fanout.batch-size:1000}")
  private int batchSize;

  @Value("${feed.backfill.days:30}")
  private int backfillDays;

  public void processFanout(
      String eventId, Long contentId, String contentType, Long authorId, long createdAtEpochMilli) {
    LocalDateTime createdAt =
        LocalDateTime.ofEpochSecond(
            createdAtEpochMilli / 1000, (int) ((createdAtEpochMilli % 1000) * 1_000_000), ZoneOffset.UTC);
    FeedItem selfItem =
        FeedItem.builder()
            .userId(authorId)
            .contentId(contentId)
            .contentType(contentType)
            .authorId(authorId)
            .score(createdAtEpochMilli)
            .createdAt(createdAt)
            .build();
    saveBatchIdempotent(List.of(selfItem));
    feedCachePort.addIfActive(authorId, selfItem);

    long followerCount = followerQueryPort.countAcceptedFollowers(authorId);
    if (followerCount >= fanoutWriteThreshold) {
      log.info(
          "[FeedFanout] Autor userId={} tem {} seguidores (>= threshold {}). Fan-out on read.",
          authorId, followerCount, fanoutWriteThreshold);
      return;
    }

    FeedFanoutProgress progress = getOrCreateProgress(eventId, contentId, authorId);
    if (progress.getStatus() == FanoutStatus.COMPLETED) {
      log.info("[FeedFanout] eventId={} já concluído, descartando", eventId);
      return;
    }

    long lastId = progress.getLastProcessedFollowerId();

    log.info("[FeedFanout] Iniciando fan-out eventId={} contentType={} contentId={} authorId={}",
        eventId, contentType, contentId, authorId);

    boolean hasMore = true;
    while (hasMore) {
      List<Long> batch = followerQueryPort.findFollowerIdsBatch(authorId, lastId, batchSize);
      if (batch.isEmpty()) {
        hasMore = false;
        break;
      }

      List<FeedItem> items =
          batch.stream()
              .map(
                  followerId ->
                      FeedItem.builder()
                          .userId(followerId)
                          .contentId(contentId)
                          .contentType(contentType)
                          .authorId(authorId)
                          .score(createdAtEpochMilli)
                          .createdAt(createdAt)
                          .build())
              .toList();

      saveBatchIdempotent(items);

      // Popula cache apenas para seguidores com sessão ativa
      items.forEach(item -> feedCachePort.addIfActive(item.getUserId(), item));

      lastId = batch.get(batch.size() - 1);
      updateProgress(progress.getId(), lastId, batch.size());

      if (batch.size() < batchSize) {
        hasMore = false;
      }
    }

    markCompleted(progress.getId());
    log.info("[FeedFanout] Fan-out concluído eventId={} totalProcessados={}", eventId, progress.getTotalProcessed());
  }

  public void processBackfill(Long newFollowerId, Long followedUserId) {
    long followerCount = followerQueryPort.countAcceptedFollowers(followedUserId);
    if (followerCount >= fanoutWriteThreshold) {
      // Fan-out on read trata este autor; backfill desnecessário
      return;
    }

    LocalDateTime since = LocalDateTime.now().minusDays(backfillDays);
    List<FeedItem> items =
        reviewRepository
            .findRecentByAuthorIds(
                List.of(followedUserId), since, PageRequest.of(0, 100))
            .stream()
            .map(
                r ->
                    FeedItem.builder()
                        .userId(newFollowerId)
                        .contentId(r.getId())
                        .contentType("REVIEW")
                        .authorId(r.getUserId())
                        .score(r.getCreatedAt().toInstant(ZoneOffset.UTC).toEpochMilli())
                        .createdAt(r.getCreatedAt())
                        .build())
            .toList();

    if (items.isEmpty()) return;

    saveBatchIdempotent(items);
    feedCachePort.evict(newFollowerId);
    log.info("[FeedBackfill] Backfill de {} reviews para userId={} seguindo userId={}", items.size(), newFollowerId, followedUserId);
  }

  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public FeedFanoutProgress getOrCreateProgress(String eventId, Long contentId, Long authorId) {
    return progressRepository
        .findByEventId(eventId)
        .orElseGet(
            () ->
                progressRepository.save(
                    FeedFanoutProgress.builder()
                        .eventId(eventId)
                        .contentId(contentId)
                        .authorId(authorId)
                        .lastProcessedFollowerId(0L)
                        .totalProcessed(0)
                        .status(FanoutStatus.IN_PROGRESS)
                        .build()));
  }

  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public void updateProgress(Long progressId, Long lastFollowerId, int batchCount) {
    progressRepository
        .findById(progressId)
        .ifPresent(
            p -> {
              p.setLastProcessedFollowerId(lastFollowerId);
              p.setTotalProcessed(p.getTotalProcessed() + batchCount);
              progressRepository.save(p);
            });
  }

  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public void markCompleted(Long progressId) {
    progressRepository
        .findById(progressId)
        .ifPresent(
            p -> {
              p.setStatus(FanoutStatus.COMPLETED);
              progressRepository.save(p);
            });
  }

  private void saveBatchIdempotent(List<FeedItem> items) {
    for (FeedItem item : items) {
      try {
        feedItemRepository.insertIgnore(
            item.getUserId(),
            item.getContentId(),
            item.getContentType(),
            item.getAuthorId(),
            item.getScore(),
            item.getCreatedAt());
      } catch (DataIntegrityViolationException ignored) {
        // Duplicata ignorada — idempotência garantida pela unique constraint
      }
    }
  }
}
