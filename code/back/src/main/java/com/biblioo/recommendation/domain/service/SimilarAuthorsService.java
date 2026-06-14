package com.biblioo.recommendation.domain.service;

import com.biblioo.recommendation.domain.model.BookScore;
import com.biblioo.recommendation.domain.model.SimilarAuthorsResult;
import com.biblioo.recommendation.infrastructure.persistence.RecommendationResultRepository;
import com.biblioo.recommendation.infrastructure.service.RecommendationFallbackWriter;
import com.biblioo.recommendation.infrastructure.service.SimilarAuthorsComputeService;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class SimilarAuthorsService {

  private static final String TRAIL_TYPE = "SIMILAR_AUTHORS";

  private final SimilarAuthorsComputeService computeService;
  private final RecommendationResultRepository resultRepository;
  private final RecommendationFallbackWriter fallbackWriter;

  @Value("${recommendation.similar-authors.candidate-limit:20}")
  private int candidateLimit;

  @Value("${recommendation.similar-authors.min-rating:4}")
  private int minRating;

  @Value("${recommendation.similar-authors.min-days-since-completed:7}")
  private int minDaysSinceCompleted;

  @Value("${recommendation.similar-authors.level1-limit:12}")
  private int level1Limit;

  @Value("${recommendation.similar-authors.level2-limit:10}")
  private int level2Limit;

  @Value("${recommendation.similar-authors.similar-users-limit:30}")
  private int similarUsersLimit;

  /**
   * Computa e persiste as recomendações SimilarAuthors para o usuário. Chamado pelo consumer a cada
   * livro concluído.
   *
   * <p>Combina nível 1 (autores confirmados) e nível 2 (autores descobertos), aplica ordenação
   * global por score DESC antes de limitar a {@code candidateLimit}. A zona de sobreposição [0.6,
   * 0.7] permite que um livro de nível 2 muito bem avaliado preceda um livro de nível 1 mal
   * avaliado — comportamento intencional (CT-15).
   */
  @CacheEvict(value = "rec-sa", key = "#userId")
  public void compute(Long userId) {

    List<BookScore> level1 =
        computeService.computeLevel1(userId, minRating, minDaysSinceCompleted, level1Limit);

    Set<Long> level1Ids = level1.stream().map(BookScore::getBookId).collect(Collectors.toSet());

    List<BookScore> level2Raw =
        computeService.computeLevel2(userId, minRating, level2Limit, similarUsersLimit);
    List<BookScore> level2 =
        level2Raw.stream().filter(bs -> !level1Ids.contains(bs.getBookId())).toList();

    List<BookScore> combined = new ArrayList<>(level1);
    combined.addAll(level2);

    if (combined.isEmpty()) {
      combined = computeService.computeFallback(userId, candidateLimit);
    } else {
      combined =
          combined.stream()
              .sorted(Comparator.comparingDouble(BookScore::getScore).reversed())
              .limit(candidateLimit)
              .toList();
    }

    resultRepository.upsert(userId, TRAIL_TYPE, combined);
  }

  /**
   * Retorna resultado pré-computado. Quando nenhum resultado existe, computa e persiste o fallback
   * global imediatamente para que chamadas subsequentes sejam rápidas (CT-27).
   */
  @Cacheable(value = "rec-sa", key = "#userId")
  public SimilarAuthorsResult get(Long userId) {
    List<BookScore> books = resultRepository.findByUserId(userId, TRAIL_TYPE);

    if (!books.isEmpty()) {
      return new SimilarAuthorsResult(books);
    }

    List<BookScore> fallback = computeService.computeFallback(userId, candidateLimit);
    fallbackWriter.persistSimilarAuthors(userId, fallback);

    return new SimilarAuthorsResult(fallback);
  }
}
