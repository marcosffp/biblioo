package com.biblioo.recommendation.domain.service;

import com.biblioo.recommendation.domain.model.BookScore;
import com.biblioo.recommendation.domain.model.CatalogSurpriseResult;
import com.biblioo.recommendation.infrastructure.service.CatalogSurpriseBanditService;
import com.biblioo.recommendation.infrastructure.service.CatalogSurpriseComputeService;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class CatalogSurpriseService {

  private final CatalogSurpriseComputeService computeService;
  private final CatalogSurpriseBanditService banditService;

  @Value("${recommendation.catalog-surprise.candidate-limit:20}")
  private int candidateLimit;

  @Value("${recommendation.catalog-surprise.candidate-pool-multiplier:3}")
  private int candidatePoolMultiplier;

  /**
   * Atualiza o estado α/β do bandit no Redis.
   * Chamado pelo consumer ao receber evento de interação do usuário com um livro.
   * Também evicta o cache para que a próxima leitura reflita o novo estado.
   */
  public void updateBanditState(Long userId, Long bookId, String status) {
    log.info("[CS] Atualizando bandit userId={} bookId={} status={}", userId, bookId, status);
    switch (status) {
      case "COMPLETED" -> {
        banditService.incrementAlpha(userId, bookId);
        evictCache(userId);
      }
      case "ABANDONED" -> {
        banditService.incrementBeta(userId, bookId);
        evictCache(userId);
      }
      default -> log.warn("[CS] Status desconhecido para atualização de bandit: {}", status);
    }
  }

  @CacheEvict(value = "rec-cs", key = "#userId")
  public void evictCache(Long userId) {
    // Evicta o cache do CatalogSurprise quando o estado alfa/beta do bandit muda.
  }

  /**
   * Computa recomendações de categorias distantes com Thompson Sampling.
   *
   * <p>O resultado é cacheado por um TTL curto (configurado em {@code rec-cs}).
   * O TTL curto preserva boa parte da natureza estocástica do Thompson Sampling
   * (theta varia entre sessões distintas) sem pagar o custo de computação a cada
   * request individual — que seria insuportável sob alta concorrência.
   *
   * <p>Trade-off intencional: usuários verão o mesmo sample dentro da janela
   * do TTL. Para variar mais, reduzir o TTL em {@code CacheConfig}; para
   * melhorar a performance sob spike, aumentar.
   */
  @Cacheable(value = "rec-cs", key = "#userId")
  public CatalogSurpriseResult getCatalogSurprise(Long userId) {
    int poolSize = candidateLimit * candidatePoolMultiplier;
    List<BookScore> candidates = computeService.getCandidates(userId, poolSize);

    if (candidates.isEmpty()) {
      return new CatalogSurpriseResult(List.of());
    }

    List<Long> bookIds = candidates.stream().map(BookScore::getBookId).toList();
    Map<Long, Double> thetas = banditService.sampleThetas(userId, bookIds);

    List<BookScore> ranked =
        candidates.stream()
            .map(
                c ->
                    new BookScore(
                        c.getBookId(),
                        thetas.getOrDefault(c.getBookId(), 0.5) * c.getScore(),
                        "thompson_sampling"))
            .sorted(Comparator.comparingDouble(BookScore::getScore).reversed())
            .limit(candidateLimit)
            .toList();

    return new CatalogSurpriseResult(ranked);
  }
}