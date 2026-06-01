package com.biblioo.recommendation.infrastructure.service;

import com.biblioo.recommendation.domain.model.PreferencesSavedEvent;
import com.biblioo.recommendation.domain.service.BecauseYouReadService;
import com.biblioo.recommendation.domain.service.FavoriteGenreNowService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
@RequiredArgsConstructor
public class PreferenceTrailBootstrapListener {

  private final FavoriteGenreNowService favoriteGenreNowService;
  private final BecauseYouReadService becauseYouReadService;

  @Async
  @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
  public void onPreferencesSaved(PreferencesSavedEvent event) {
    Long userId = event.getUserId();
    log.info("[Bootstrap] Iniciando trilhos cold-start para userId={} gêneros={} livros={}",
        userId, event.getGenres().size(), event.getBookIds().size());

    if (!event.getGenres().isEmpty()) {
      try {
        favoriteGenreNowService.compute(userId);
      } catch (Exception ex) {
        log.warn("[Bootstrap] Falha ao computar FGN cold-start userId={}: {}", userId, ex.getMessage());
      }
    }

    if (!event.getBookIds().isEmpty()) {
      try {
        becauseYouReadService.computeFromPreference(userId, event.getBookIds().get(0));
      } catch (Exception ex) {
        log.warn("[Bootstrap] Falha ao computar BYR cold-start userId={}: {}", userId, ex.getMessage());
      }
    }

    log.info("[Bootstrap] Trilhos cold-start concluídos para userId={}", userId);
  }
}
