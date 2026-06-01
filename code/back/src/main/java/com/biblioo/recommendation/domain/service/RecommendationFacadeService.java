package com.biblioo.recommendation.domain.service;

import com.biblioo.recommendation.domain.model.BecauseYouReadResult;
import com.biblioo.recommendation.domain.model.CatalogSurpriseResult;
import com.biblioo.recommendation.domain.model.FavoriteGenreNowResult;
import com.biblioo.recommendation.domain.model.RereadWorthItResult;
import com.biblioo.recommendation.domain.model.SimilarAuthorsResult;
import com.biblioo.recommendation.domain.model.TrendingInCommunitiesResult;
import com.biblioo.recommendation.domain.port.in.RecommendationUseCase;
import jakarta.annotation.PostConstruct;
import java.util.concurrent.Semaphore;
import java.util.function.Supplier;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.Cache;
import org.springframework.cache.Cache.ValueWrapper;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecommendationFacadeService implements RecommendationUseCase {

  private final BecauseYouReadService becauseYouReadService;
  private final FavoriteGenreNowService favoriteGenreNowService;
  private final TrendingInCommunitiesService trendingInCommunitiesService;
  private final CatalogSurpriseService catalogSurpriseService;
  private final RereadWorthItService rereadWorthItService;
  private final SimilarAuthorsService similarAuthorsService;
  private final CacheManager cacheManager;

  /**
   * Limite de queries simultâneas que tocam o banco/Redis de computação.
   * Não se aplica a cache hits — estes são servidos diretamente do Redis
   * sem passar pelo semáforo. Deve ser próximo ao hikari.maximum-pool-size.
   *
   * <p>Regra prática: (hikari.maximum-pool-size - 2), reservando 2 conexões
   * para consumers e operações administrativas.
   */
  @Value("${recommendation.db-concurrency-limit:20}")
  private int dbConcurrencyLimit;

  private Semaphore dbThrottle;

  @PostConstruct
  private void init() {
    this.dbThrottle = new Semaphore(dbConcurrencyLimit, true);
    log.info("[Recommendation] db-concurrency-limit={}", dbConcurrencyLimit);
  }

  /**
   * Tenta retornar o valor diretamente do cache, sem adquirir o semáforo.
   * Se o cache estiver frio ou tiver expirado, delega para {@code fn} sob throttle.
   *
   * <p>Esse padrão é necessário porque {@code @Cacheable} fica dentro do método
   * de serviço — ou seja, dentro do {@code throttled()} — e o semáforo acabaria
   * bloqueando cache hits desnecessariamente. Com 300 VUs e semáforo de 20 permits,
   * mesmo uma resposta Redis de 5ms criaria uma fila de ~1780 threads aguardando,
   * elevando o p95 para vários segundos mesmo com cache quente.
   *
   * @param cacheName  nome do cache Redis conforme {@code CacheConfig}
   * @param userId     chave de cache (mesma usada pelo {@code @Cacheable} dos serviços)
   * @param fn         supplier que chama o método de serviço (executa somente em cache miss)
   */
  @SuppressWarnings("unchecked")
  private <T> T cachedOrThrottled(String cacheName, Long userId, Supplier<T> fn) {
    Cache cache = cacheManager.getCache(cacheName);
    if (cache != null) {
      ValueWrapper cached = cache.get(userId);
      if (cached != null) {
        return (T) cached.get();
      }
    }
    // Cache miss: throttla para não sobrepor o pool do banco
    return throttled(fn);
  }

  private <T> T throttled(Supplier<T> fn) {
    dbThrottle.acquireUninterruptibly();
    try {
      return fn.get();
    } finally {
      dbThrottle.release();
    }
  }

  @Override
  public BecauseYouReadResult getBecauseYouRead(Long userId) {
    return cachedOrThrottled("rec-byr", userId, () -> becauseYouReadService.get(userId));
  }

  @Override
  public FavoriteGenreNowResult getFavoriteGenreNow(Long userId) {
    return cachedOrThrottled("rec-fgn", userId, () -> favoriteGenreNowService.get(userId));
  }

  @Override
  public TrendingInCommunitiesResult getTrendingInCommunities(Long userId) {
    return cachedOrThrottled("rec-tic", userId, () -> trendingInCommunitiesService.get(userId));
  }

  @Override
  public CatalogSurpriseResult getCatalogSurprise(Long userId) {
    return cachedOrThrottled("rec-cs", userId, () -> catalogSurpriseService.getCatalogSurprise(userId));
  }

  @Override
  public RereadWorthItResult getRereadWorthIt(Long userId) {
    return cachedOrThrottled("rec-rwi", userId, () -> rereadWorthItService.get(userId));
  }

  @Override
  public SimilarAuthorsResult getSimilarAuthors(Long userId) {
    return cachedOrThrottled("rec-sa", userId, () -> similarAuthorsService.get(userId));
  }
}