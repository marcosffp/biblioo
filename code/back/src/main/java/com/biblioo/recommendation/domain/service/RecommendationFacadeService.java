package com.biblioo.recommendation.domain.service;

import com.biblioo.recommendation.domain.model.BecauseYouReadResult;
import com.biblioo.recommendation.domain.model.CatalogSurpriseResult;
import com.biblioo.recommendation.domain.model.FavoriteGenreNowResult;
import com.biblioo.recommendation.domain.model.RereadWorthItResult;
import com.biblioo.recommendation.domain.model.SimilarAuthorsResult;
import com.biblioo.recommendation.domain.model.TrendingInCommunitiesResult;
import com.biblioo.recommendation.domain.port.in.RecommendationUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RecommendationFacadeService implements RecommendationUseCase {

  private final BecauseYouReadService becauseYouReadService;
  private final FavoriteGenreNowService favoriteGenreNowService;
  private final TrendingInCommunitiesService trendingInCommunitiesService;
  private final CatalogSurpriseService catalogSurpriseService;
  private final RereadWorthItService rereadWorthItService;
  private final SimilarAuthorsService similarAuthorsService;

  @Override
  public BecauseYouReadResult getBecauseYouRead(Long userId) {
    return becauseYouReadService.get(userId);
  }

  @Override
  public FavoriteGenreNowResult getFavoriteGenreNow(Long userId) {
    return favoriteGenreNowService.get(userId);
  }

  @Override
  public TrendingInCommunitiesResult getTrendingInCommunities(Long userId) {
    return trendingInCommunitiesService.get(userId);
  }

  @Override
  public CatalogSurpriseResult getCatalogSurprise(Long userId) {
    return catalogSurpriseService.getCatalogSurprise(userId);
  }

  @Override
  public RereadWorthItResult getRereadWorthIt(Long userId) {
    return rereadWorthItService.get(userId);
  }

  @Override
  public SimilarAuthorsResult getSimilarAuthors(Long userId) {
    return similarAuthorsService.get(userId);
  }
}
