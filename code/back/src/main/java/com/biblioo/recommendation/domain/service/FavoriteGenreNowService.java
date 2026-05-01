package com.biblioo.recommendation.domain.service;

import com.biblioo.recommendation.domain.model.BookScore;
import com.biblioo.recommendation.domain.model.FavoriteGenreNowResult;
import com.biblioo.recommendation.infrastructure.persistence.RecommendationResultRepository;
import com.biblioo.recommendation.infrastructure.service.FavoriteGenreNowComputeService;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class FavoriteGenreNowService {

  private static final String TRAIL_TYPE = "FAVORITE_GENRE_NOW";

  private final FavoriteGenreNowComputeService computeService;
  private final RecommendationResultRepository resultRepository;

  @Value("${recommendation.favorite-genre-now.candidate-limit:20}")
  private int candidateLimit;

  @Value("${recommendation.favorite-genre-now.top-genres-count:3}")
  private int topGenresCount;

  @Value("${recommendation.favorite-genre-now.min-reviews:10}")
  private int minReviews;

  @CacheEvict(value = "rec-fgn", key = "#userId")
  public void compute(Long userId) {
    log.info("[FGN] Computando trilho FavoriteGenreNow para userId={}", userId);

    List<Object[]> genreRows = computeService.computeTopGenres(userId, topGenresCount);

    if (genreRows.isEmpty()) {
      log.info("[FGN] Histórico insuficiente para userId={}, mantendo resultado anterior", userId);
      return;
    }

    List<Long> categoryIds = genreRows.stream().map(r -> ((Number) r[0]).longValue()).toList();
    List<String> genreNames = genreRows.stream().map(r -> (String) r[1]).toList();

    // Estágio 1 — livros com reviews suficientes (dado confiável)
    List<BookScore> primary = computeService.computeBooks(userId, categoryIds, candidateLimit, minReviews);

    List<BookScore> books;
    if (primary.size() >= candidateLimit) {
      books = primary;
    } else {
      // Estágio 2 — preenche slots restantes por popularidade (reader_count),
      // excluindo os já retornados no primário e os já lidos/em leitura pelo usuário
      int remaining = candidateLimit - primary.size();
      List<Long> alreadyFound = primary.stream().map(BookScore::getBookId).toList();
      List<BookScore> fallback =
          computeService.computeBooksByPopularity(userId, categoryIds, remaining, alreadyFound);

      if (primary.isEmpty() && fallback.isEmpty()) {
        log.info(
            "[FGN] Nenhum candidato nos gêneros para userId={}, mantendo resultado anterior",
            userId);
        return;
      }

      books = new ArrayList<>(primary);
      books.addAll(fallback);

      log.info(
          "[FGN] Resultado combinado: {} rated + {} popular para userId={}",
          primary.size(),
          fallback.size(),
          userId);
    }

    resultRepository.upsertWithMetadata(userId, TRAIL_TYPE, books, genreNames);

    log.info(
        "[FGN] {} recomendações persistidas para userId={} gêneros={}",
        books.size(),
        userId,
        genreNames);
  }

  @Cacheable(value = "rec-fgn", key = "#userId")
  public FavoriteGenreNowResult get(Long userId) {
    return resultRepository.findFavoriteGenreNowResult(userId);
  }
}
