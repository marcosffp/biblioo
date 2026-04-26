package com.biblioo.recommendation.domain.service;

import com.biblioo.recommendation.domain.model.BecauseYouReadResult;
import com.biblioo.recommendation.domain.model.FavoriteGenreNowResult;
import com.biblioo.recommendation.domain.port.in.RecommendationUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RecommendationFacadeService implements RecommendationUseCase {

  private final BecauseYouReadService becauseYouReadService;
  private final FavoriteGenreNowService favoriteGenreNowService;

  @Override
  public BecauseYouReadResult getBecauseYouRead(Long userId) {
    return becauseYouReadService.get(userId);
  }

  @Override
  public FavoriteGenreNowResult getFavoriteGenreNow(Long userId) {
    return favoriteGenreNowService.get(userId);
  }
}
