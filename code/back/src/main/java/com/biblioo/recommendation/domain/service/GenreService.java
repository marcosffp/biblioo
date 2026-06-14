package com.biblioo.recommendation.domain.service;

import com.biblioo.recommendation.domain.model.GenreTranslation;
import com.biblioo.recommendation.domain.port.in.GenreUseCase;
import com.biblioo.recommendation.infrastructure.service.CategoryQueryService;
import com.biblioo.recommendation.infrastructure.service.GenreTranslationService;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class GenreService implements GenreUseCase {

  private final CategoryQueryService categoryQueryService;
  private final GenreTranslationService translationService;

  @Override
  @Cacheable(value = "genres-all", key = "'all'")
  public List<GenreTranslation> getAllGenres() {

    List<String> rawNames = categoryQueryService.findAllNames();
    List<String> canonical = deduplicateAndNormalize(rawNames);


    Map<String, String> translations = translationService.translateBatch(canonical);

    return canonical.stream()
        .map(
            name ->
                GenreTranslation.builder()
                    .original(name)
                    .translated(translations.getOrDefault(name, name))
                    .build())
        .sorted(
            Comparator.comparing(
                GenreTranslation::getTranslated, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)))
        .toList();
  }

  private List<String> deduplicateAndNormalize(List<String> names) {
    LinkedHashMap<String, String> seen = new LinkedHashMap<>();
    for (String name : names) {
      String key =
          name.trim()
              .toLowerCase(Locale.ROOT)
              .replaceAll("[\\s_\\-]+", " ")
              .replaceAll("[^a-z0-9 ]", "")
              .strip();
      seen.putIfAbsent(key, name.trim());
    }
    return new ArrayList<>(seen.values());
  }
}
