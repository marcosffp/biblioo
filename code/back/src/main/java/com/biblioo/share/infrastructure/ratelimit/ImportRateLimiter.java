package com.biblioo.share.infrastructure.ratelimit;

import com.biblioo.share.domain.exception.GoodreadsImportException;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import java.time.Duration;
import java.util.concurrent.TimeUnit;
import org.springframework.stereotype.Component;

/**
 * Per-user in-memory rate limiter for Goodreads CSV imports. Each user is allowed at most
 * MAX_IMPORTS imports per WINDOW (sliding refill). Buckets are cached in-memory with a TTL to avoid
 * unbounded growth.
 */
@Component
public class ImportRateLimiter {

  private static final int MAX_IMPORTS = 5;
  private static final Duration WINDOW = Duration.ofHours(1);

  private final Cache<Long, Bucket> buckets =
      Caffeine.newBuilder().expireAfterAccess(2, TimeUnit.HOURS).maximumSize(50_000).build();

  public void checkAndConsume(Long userId) {
    Bucket bucket = buckets.get(userId, this::newBucket);
    if (!bucket.tryConsume(1)) {
      throw new GoodreadsImportException(
          "Limite de importações atingido. Você pode importar no máximo "
              + MAX_IMPORTS
              + " arquivos por hora. Tente novamente mais tarde.");
    }
  }

  private Bucket newBucket(Long ignored) {
    return Bucket.builder()
        .addLimit(
            Bandwidth.builder().capacity(MAX_IMPORTS).refillGreedy(MAX_IMPORTS, WINDOW).build())
        .build();
  }
}
