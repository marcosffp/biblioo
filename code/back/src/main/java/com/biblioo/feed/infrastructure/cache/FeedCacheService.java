package com.biblioo.feed.infrastructure.cache;

import com.biblioo.feed.domain.model.FeedItem;
import com.biblioo.feed.domain.port.out.FeedCachePort;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class FeedCacheService implements FeedCachePort {

  private final StringRedisTemplate redisTemplate;
  private final ObjectMapper objectMapper;

  @Value("${feed.cache.ttl-minutes:30}")
  private int ttlMinutes;

  private static final String KEY_PREFIX = "feed:";

  private String key(Long userId) {
    return KEY_PREFIX + userId;
  }

  @Override
  public List<FeedItem> getCachedPage(Long userId, String cursor, int size) {
    String key = key(userId);
    ZSetOperations<String, String> ops = redisTemplate.opsForZSet();

    Set<String> members;
    if (cursor == null) {
      members = ops.reverseRange(key, 0, size - 1L);
    } else {
      long maxScore = parseCursorScore(cursor) - 1;
      members = ops.reverseRangeByScore(key, Double.NEGATIVE_INFINITY, maxScore, 0, size);
    }

    if (members == null || members.isEmpty()) return Collections.emptyList();

    List<FeedItem> items = new ArrayList<>();
    for (String json : members) {
      FeedItem item = deserialize(json);
      if (item != null) items.add(item);
    }
    return items;
  }

  @Override
  public boolean isCacheWarm(Long userId) {
    return Boolean.TRUE.equals(redisTemplate.hasKey(key(userId)));
  }

  @Override
  public void populate(Long userId, List<FeedItem> items) {
    if (items == null || items.isEmpty()) return;
    String key = key(userId);
    ZSetOperations<String, String> ops = redisTemplate.opsForZSet();

    for (FeedItem item : items) {
      String json = serialize(item);
      if (json != null) {
        ops.add(key, json, item.getScore());
      }
    }
    redisTemplate.expire(key, Duration.ofMinutes(ttlMinutes));
  }

  @Override
  public void addIfActive(Long userId, FeedItem item) {
    String key = key(userId);
    if (!Boolean.TRUE.equals(redisTemplate.hasKey(key))) return;

    String json = serialize(item);
    if (json != null) {
      redisTemplate.opsForZSet().add(key, json, item.getScore());
      redisTemplate.expire(key, Duration.ofMinutes(ttlMinutes));
    }
  }

  @Override
  public long countNewItems(Long userId, long sinceScore) {
    Long count = redisTemplate.opsForZSet().count(key(userId), sinceScore + 1, Double.MAX_VALUE);
    return count != null ? count : 0L;
  }

  @Override
  public long countRemaining(Long userId, String cursor) {
    String key = key(userId);
    if (cursor == null) {
      Long total = redisTemplate.opsForZSet().size(key);
      return total != null ? total : 0L;
    }
    long maxScore = parseCursorScore(cursor) - 1;
    Long count = redisTemplate.opsForZSet().count(key, Double.NEGATIVE_INFINITY, maxScore);
    return count != null ? count : 0L;
  }

  @Override
  public void evict(Long userId) {
    redisTemplate.delete(key(userId));
  }

  private long parseCursorScore(String cursor) {
    try {
      return Long.parseLong(cursor.split("_")[0]);
    } catch (Exception ex) {
      return Long.MAX_VALUE;
    }
  }

  private String serialize(FeedItem item) {
    try {
      return objectMapper.writeValueAsString(item);
    } catch (JsonProcessingException ex) {
      log.error("Falha ao serializar FeedItem contentId={}: {}", item.getContentId(), ex.getMessage());
      return null;
    }
  }

  private FeedItem deserialize(String json) {
    try {
      return objectMapper.readValue(json, FeedItem.class);
    } catch (JsonProcessingException ex) {
      log.error("Falha ao deserializar FeedItem do cache: {}", ex.getMessage());
      return null;
    }
  }
}
