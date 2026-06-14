package com.biblioo.recommendation.domain.service;

import com.biblioo.recommendation.domain.model.BookScore;
import com.biblioo.recommendation.domain.model.FavoriteGenreNowResult;
import com.biblioo.recommendation.domain.model.UserPreference;
import com.biblioo.recommendation.infrastructure.persistence.RecommendationResultRepository;
import com.biblioo.recommendation.infrastructure.persistence.UserPreferenceJpaRepository;
import com.biblioo.recommendation.infrastructure.service.FavoriteGenreNowComputeService;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
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
  private final UserPreferenceJpaRepository userPreferenceRepository;

  @Value("${recommendation.favorite-genre-now.candidate-limit:20}")
  private int candidateLimit;

  @Value("${recommendation.favorite-genre-now.top-genres-count:3}")
  private int topGenresCount;

  @Value("${recommendation.favorite-genre-now.min-reviews:10}")
  private int minReviews;

  @CacheEvict(value = "rec-fgn", key = "#userId")
  public void compute(Long userId) {

    List<Object[]> genreRows = computeService.computeTopGenres(userId, topGenresCount);

    List<Long> categoryIds;
    List<String> genreNames;

    if (genreRows.isEmpty()) {
      // Cold-start: usa gêneros das preferências do usuário
      Optional<UserPreference> pref = userPreferenceRepository.findByUserId(userId);
      if (pref.isEmpty() || pref.get().getGenres().isEmpty()) {
        return;
      }
      List<String> preferredGenres = pref.get().getGenres();
      List<Long> resolvedIds = computeService.resolveGenreNamesToIds(preferredGenres);
      if (resolvedIds.isEmpty()) {
        return;
      }
      categoryIds = resolvedIds;
      genreNames = preferredGenres;
    } else {
      categoryIds = genreRows.stream().map(r -> ((Number) r[0]).longValue()).toList();
      genreNames = genreRows.stream().map(r -> (String) r[1]).toList();
    }

    // Estágio 1 — livros com reviews suficientes (dado confiável)
    List<BookScore> primary = computeService.computeBooks(userId, categoryIds, candidateLimit, minReviews);

    List<BookScore> books;
    if (primary.size() >= candidateLimit) {
      books = primary;
    } else {
      // Estágio 2 — preenche slots restantes por popularidade,
      // excluindo os já retornados no primário e os já lidos/em leitura pelo usuário
      int remaining = candidateLimit - primary.size();
      List<Long> alreadyFound = primary.stream().map(BookScore::getBookId).toList();
      List<BookScore> fallback =
          computeService.computeBooksByPopularity(userId, categoryIds, remaining, alreadyFound);

      if (primary.isEmpty() && fallback.isEmpty()) {
        return;
      }

      books = new ArrayList<>(primary);
      books.addAll(fallback);

    }

    resultRepository.upsertWithMetadata(userId, TRAIL_TYPE, books, genreNames);

  }

  @Cacheable(value = "rec-fgn", key = "#userId")
  public FavoriteGenreNowResult get(Long userId) {
    return resultRepository.findFavoriteGenreNowResult(userId);
  }
}
