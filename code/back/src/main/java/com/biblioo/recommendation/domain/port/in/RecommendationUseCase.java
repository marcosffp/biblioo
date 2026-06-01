package com.biblioo.recommendation.domain.port.in;

import com.biblioo.recommendation.domain.model.BecauseYouReadResult;
import com.biblioo.recommendation.domain.model.CatalogSurpriseResult;
import com.biblioo.recommendation.domain.model.FavoriteGenreNowResult;
import com.biblioo.recommendation.domain.model.RereadWorthItResult;
import com.biblioo.recommendation.domain.model.SimilarAuthorsResult;
import com.biblioo.recommendation.domain.model.TrendingInCommunitiesResult;

public interface RecommendationUseCase {

  BecauseYouReadResult getBecauseYouRead(Long userId);

  FavoriteGenreNowResult getFavoriteGenreNow(Long userId);

  TrendingInCommunitiesResult getTrendingInCommunities(Long userId);

  CatalogSurpriseResult getCatalogSurprise(Long userId);

  RereadWorthItResult getRereadWorthIt(Long userId);

  SimilarAuthorsResult getSimilarAuthors(Long userId);
}
