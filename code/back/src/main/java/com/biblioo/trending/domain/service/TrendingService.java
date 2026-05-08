package com.biblioo.trending.domain.service;

import com.biblioo.trending.domain.model.TrendingBookItem;
import com.biblioo.trending.domain.model.TrendingCommunityItem;
import com.biblioo.trending.domain.port.in.TrendingUseCase;
import com.biblioo.trending.domain.port.out.TrendingComputePort;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class TrendingService implements TrendingUseCase {

  private final TrendingComputePort trendingComputePort;

  @Override
  @Cacheable(cacheNames = "trending-communities")
  public List<TrendingCommunityItem> getTopCommunities() {
    log.info("Calculando top 10 comunidades em tendência");
    return trendingComputePort.computeTopCommunities();
  }

  @Override
  @Cacheable(cacheNames = "trending-books")
  public List<TrendingBookItem> getTopBooks() {
    log.info("Calculando top 10 livros em tendência");
    return trendingComputePort.computeTopBooks();
  }

  @CacheEvict(cacheNames = {"trending-communities", "trending-books"}, allEntries = true)
  public void evictAllTrendingCaches() {
    log.info("Cache de trending invalidado pelo scheduler");
  }
}
