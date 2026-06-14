package com.biblioo.recommendation.domain.service;

import com.biblioo.recommendation.domain.model.BecauseYouReadResult;
import com.biblioo.recommendation.domain.model.BookScore;
import com.biblioo.recommendation.infrastructure.graph.Neo4jGraphService;
import com.biblioo.recommendation.infrastructure.persistence.RecommendationResultRepository;
import com.biblioo.recommendation.infrastructure.service.BecauseYouReadComputeService;
import java.util.Comparator;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class BecauseYouReadService {

  private final Neo4jGraphService neo4jGraphService;
  private final BecauseYouReadComputeService computeService;
  private final RecommendationResultRepository resultRepository;

  @Value("${recommendation.t1.candidate-limit}")
  private int candidateLimit;

  @Value("${recommendation.t1.score-jitter-pct}")
  private double jitterPct;

  @Value("${recommendation.t1.max-same-category-ratio}")
  private double maxSameCategoryRatio;

  @CacheEvict(value = "rec-byr", key = "#userId")
  public void compute(
      Long userId, Long bookId, Long shelfItemId, String finishedAt, String seedBookTitle) {
    try {
      neo4jGraphService.mergeReadRelationship(userId, bookId, finishedAt, shelfItemId);
    } catch (Exception ex) {
      log.warn(
          "[BYR] Falha ao atualizar grafo user={} book={}: {}", userId, bookId, ex.getMessage());
    }

    List<BookScore> candidates = computeWithFallback(userId, bookId);

    if (candidates.isEmpty()) {
      return;
    }

    List<BookScore> processed = postProcess(candidates);

    resultRepository.upsertByr(userId, processed, seedBookTitle);

  }

  @CacheEvict(value = "rec-byr", key = "#userId")
  public void computeFromPreference(Long userId, Long bookId) {
    List<BookScore> candidates = computeService.compute(userId, bookId);
    if (candidates.isEmpty()) {
      return;
    }
    List<BookScore> processed = postProcess(candidates);
    String seedTitle = computeService.getBookTitle(bookId);
    resultRepository.upsertByr(userId, processed, seedTitle);

  }

  @Cacheable(value = "rec-byr", key = "#userId")
  public BecauseYouReadResult get(Long userId) {
    return resultRepository.findBecauseYouReadResult(userId);
  }

  private List<BookScore> computeWithFallback(Long userId, Long bookId) {
    try {
      List<BookScore> graphResults = neo4jGraphService.computeT1(userId, bookId, candidateLimit);
      if (!graphResults.isEmpty()) {
        return graphResults;
      }

      return computeService.compute(userId, bookId);
    } catch (Exception ex) {
      log.warn(
          "[BYR] Neo4j indisponível para user={} book={}, ativando fallback SQL. Causa: {}",
          userId,
          bookId,
          ex.getMessage());
      return computeService.compute(userId, bookId);
    }
  }

  private List<BookScore> postProcess(List<BookScore> candidates) {
    Random random = new Random();

    return candidates.stream()
        .map(
            bs -> {
              double noise =
                  bs.getScore() * (1.0 + (random.nextDouble() * 2 * jitterPct) - jitterPct);
              double capped = Math.min(1.0, Math.max(0.0, noise));
              return new BookScore(bs.getBookId(), capped, bs.getSource());
            })
        .sorted(Comparator.comparingDouble(BookScore::getScore).reversed())
        .limit(candidateLimit)
        .collect(Collectors.toList());
  }
}
