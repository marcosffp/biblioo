package com.biblioo.recommendation.domain.port.in;

import com.biblioo.recommendation.domain.model.BecauseYouReadResult;
import com.biblioo.recommendation.domain.model.FavoriteGenreNowResult;

public interface RecommendationUseCase {

  BecauseYouReadResult getBecauseYouRead(Long userId);

  FavoriteGenreNowResult getFavoriteGenreNow(Long userId);
}
