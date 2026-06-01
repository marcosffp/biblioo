package com.biblioo.trending.infrastructure.config;

import com.biblioo.trending.domain.service.TrendingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
class TrendingScheduler {

  private final TrendingService trendingService;

  @Scheduled(cron = "${trending.refresh-cron:0 */15 * * * *}")
  public void refreshTrendingCache() {
    trendingService.evictAllTrendingCaches();
    trendingService.getTopCommunities();
    trendingService.getTopBooks();
  }
}
