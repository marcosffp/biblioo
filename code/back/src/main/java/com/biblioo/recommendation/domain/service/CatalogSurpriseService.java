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
   */
  public void updateBanditState(Long userId, Long bookId, String status) {
    log.info("[CS] Atualizando bandit userId={} bookId={} status={}", userId, bookId, status);
    switch (status) {
      case "COMPLETED" -> banditService.incrementAlpha(userId, bookId);
      case "ABANDONED" -> banditService.incrementBeta(userId, bookId);
      default -> log.warn("[CS] Status desconhecido para atualização de bandit: {}", status);
    }
  }

  /**
   * Computa recomendações de categorias distantes com Thompson Sampling.
   * Executado sob demanda no GET request — sem cache de resultado final
   * pois o sample Beta muda a cada chamada (exploração estocástica).
   */
  public CatalogSurpriseResult getCatalogSurprise(Long userId) {
    int poolSize = candidateLimit * candidatePoolMultiplier;
    List<BookScore> candidates = computeService.getCandidates(userId, poolSize);

    if (candidates.isEmpty()) {
      log.info("[CS] Nenhum candidato para userId={}", userId);
      return new CatalogSurpriseResult(List.of());
    }

    List<Long> bookIds = candidates.stream().map(BookScore::getBookId).toList();
    Map<Long, Double> thetas = banditService.sampleThetas(userId, bookIds);

    // Score final = θ_i (bandit) × base_score_i (qualidade global)
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

    log.info("[CS] {} recomendações geradas para userId={}", ranked.size(), userId);
    return new CatalogSurpriseResult(ranked);
  }
}
