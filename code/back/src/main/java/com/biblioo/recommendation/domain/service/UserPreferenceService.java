package com.biblioo.recommendation.domain.service;

import com.biblioo.recommendation.domain.exception.InvalidPreferenceException;
import com.biblioo.recommendation.domain.model.PreferencesSavedEvent;
import com.biblioo.recommendation.domain.model.UserPreference;
import com.biblioo.recommendation.domain.port.in.UserPreferenceUseCase;
import com.biblioo.recommendation.infrastructure.persistence.UserPreferenceJpaRepository;
import com.biblioo.recommendation.infrastructure.service.PreferenceCatalogAdapter;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserPreferenceService implements UserPreferenceUseCase {

  private final UserPreferenceJpaRepository repository;
  private final PreferenceCatalogAdapter catalogAdapter;
  private final ApplicationEventPublisher eventPublisher;

  @Override
  @Transactional
  public UserPreference savePreferences(Long userId, List<String> genres, List<Long> bookIds) {
    if (repository.findByUserId(userId).isPresent()) {
      throw new InvalidPreferenceException("Preferências já foram configuradas e não podem ser alteradas");
    }

    List<String> normalizedGenres =
        genres.stream().filter(Objects::nonNull).map(String::trim).filter(s -> !s.isBlank()).distinct().toList();

    List<Long> uniqueBookIds =
        bookIds.stream().filter(Objects::nonNull).distinct().toList();

    if (!normalizedGenres.isEmpty()) {
      validateGenres(normalizedGenres);
    }

    if (!uniqueBookIds.isEmpty()) {
      validateBooks(uniqueBookIds);
    }

    UserPreference preference = UserPreference.builder()
        .userId(userId)
        .genres(new ArrayList<>(normalizedGenres))
        .bookIds(new ArrayList<>(uniqueBookIds))
        .build();

    UserPreference saved = repository.save(preference);

    eventPublisher.publishEvent(new PreferencesSavedEvent(userId, normalizedGenres, uniqueBookIds));

    return saved;
  }

  private void validateGenres(List<String> genres) {
    List<String> found = catalogAdapter.findExistingGenreNames(genres);
    if (found.size() != genres.size()) {
      Set<String> foundSet = new HashSet<>(found);
      List<String> invalid = genres.stream().filter(g -> !foundSet.contains(g)).toList();
      throw new InvalidPreferenceException("Gêneros não encontrados na plataforma: " + invalid);
    }
  }

  private void validateBooks(List<Long> bookIds) {
    List<Long> found = catalogAdapter.findExistingBookIds(bookIds);
    if (found.size() != bookIds.size()) {
      Set<Long> foundSet = new HashSet<>(found);
      List<Long> invalid = bookIds.stream().filter(id -> !foundSet.contains(id)).toList();
      throw new InvalidPreferenceException("Livros não encontrados: " + invalid);
    }
  }
}
