package com.biblioo.recommendation.infrastructure.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisOperations;
import org.springframework.data.redis.core.SessionCallback;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class CatalogSurpriseBanditService {

  private static final String KEY_PREFIX = "cs:bandit:";

  private final StringRedisTemplate redisTemplate;

  @Value("${recommendation.catalog-surprise.alpha-prior:1}")
  private int alphaPrior;

  @Value("${recommendation.catalog-surprise.beta-prior:1}")
  private int betaPrior;

  @Value("${recommendation.catalog-surprise.redis-ttl-days:90}")
  private long redisTtlDays;

  /**
   * Cap para limitar o custo de O(α+β) no sample de Beta(α,β). Após paramCap interações, o
   * parâmetro é tratado como se fosse paramCap.
   */
  @Value("${recommendation.catalog-surprise.param-cap:30}")
  private int paramCap;

  public void incrementAlpha(Long userId, Long bookId) {
    String key = buildKey(userId, bookId);
    redisTemplate.opsForHash().increment(key, "a", 1);
    redisTemplate.expire(key, redisTtlDays, TimeUnit.DAYS);
  }

  public void incrementBeta(Long userId, Long bookId) {
    String key = buildKey(userId, bookId);
    redisTemplate.opsForHash().increment(key, "b", 1);
    redisTemplate.expire(key, redisTtlDays, TimeUnit.DAYS);
  }

  /**
   * Amostra θ_i ~ Beta(α_i, β_i) para cada bookId em um único round-trip Redis via pipeline.
   *
   * <p>Livros sem histórico recebem prior Beta(alphaPrior, betaPrior) = Beta(1,1) = Uniform,
   * garantindo exploração justa no cold start.
   */
  public Map<Long, Double> sampleThetas(Long userId, List<Long> bookIds) {
    if (bookIds.isEmpty()) {
      return Map.of();
    }

    List<Object> pipelineResults =
        redisTemplate.executePipelined(
            new SessionCallback<Object>() {
              @Override
              @SuppressWarnings("unchecked")
              public <K, V> Object execute(RedisOperations<K, V> ops) {
                RedisOperations<String, String> stringOps = (RedisOperations<String, String>) ops;
                for (Long bookId : bookIds) {
                  stringOps.opsForHash().entries(buildKey(userId, bookId));
                }
                return null;
              }
            });

    Map<Long, Double> thetas = new HashMap<>(bookIds.size());
    for (int i = 0; i < bookIds.size(); i++) {
      @SuppressWarnings("unchecked")
      Map<String, String> vals = (Map<String, String>) pipelineResults.get(i);
      // Prior é somado ao valor Redis, não substituído por ele.
      // Redis HINCRBY começa em 0; sem esta adição o primeiro COMPLETED não alteraria
      // o sample (Redis a=1 == prior=1 → Beta(1,1) = cold start, incremento invisível).
      // Com adição: cold start → α=1+0=1, após 1 COMPLETED → α=1+1=2, como esperado.
      int storedAlpha =
          (vals != null && vals.containsKey("a")) ? parseIntSafe(vals.get("a"), 0) : 0;
      int storedBeta = (vals != null && vals.containsKey("b")) ? parseIntSafe(vals.get("b"), 0) : 0;
      int alpha = alphaPrior + storedAlpha;
      int beta = betaPrior + storedBeta;
      thetas.put(bookIds.get(i), sampleBeta(alpha, beta));
    }
    return thetas;
  }

  /**
   * Amostra Beta(α, β) pelo método de somas de Gamas com parâmetro inteiro. Gamma(k) ≈ -Σ ln(U_i)
   * para U_i ~ Uniform(0,1), válido para k inteiro ≥ 1. Parâmetros são limitados a paramCap para
   * garantir custo O(1) na prática.
   */
  private double sampleBeta(int alpha, int beta) {
    ThreadLocalRandom rng = ThreadLocalRandom.current();
    int a = Math.min(alpha, paramCap);
    int b = Math.min(beta, paramCap);
    double x = 0.0;
    double y = 0.0;
    // 1.0 - nextDouble() ∈ (0,1] → log definido
    for (int i = 0; i < a; i++) x -= Math.log(1.0 - rng.nextDouble());
    for (int i = 0; i < b; i++) y -= Math.log(1.0 - rng.nextDouble());
    double total = x + y;
    return total > 0.0 ? x / total : 0.5;
  }

  private String buildKey(Long userId, Long bookId) {
    return KEY_PREFIX + userId + ":" + bookId;
  }

  private int parseIntSafe(String val, int fallback) {
    try {
      return Integer.parseInt(val);
    } catch (NumberFormatException ex) {
      log.warn("[CS-Bandit] Valor Redis inválido '{}', usando prior={}", val, fallback);
      return fallback;
    }
  }
}
