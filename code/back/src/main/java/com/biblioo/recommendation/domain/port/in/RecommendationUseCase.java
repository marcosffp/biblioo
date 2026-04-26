package com.biblioo.recommendation.domain.port.in;

import com.biblioo.recommendation.domain.model.BecauseYouReadResult;
import com.biblioo.recommendation.domain.model.FavoriteGenreNowResult;
import com.biblioo.recommendation.domain.model.TrendingInCommunitiesResult;

public interface RecommendationUseCase {

  BecauseYouReadResult getBecauseYouRead(Long userId);

  FavoriteGenreNowResult getFavoriteGenreNow(Long userId);

  TrendingInCommunitiesResult getTrendingInCommunities(Long userId);
}
