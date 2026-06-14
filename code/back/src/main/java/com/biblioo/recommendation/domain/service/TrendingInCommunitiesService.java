package com.biblioo.recommendation.domain.service;

import com.biblioo.recommendation.domain.model.BookScore;
import com.biblioo.recommendation.domain.model.TrendingInCommunitiesResult;
import com.biblioo.recommendation.infrastructure.persistence.CommunityTrendingRepository;
import com.biblioo.recommendation.infrastructure.service.TrendingInCommunitiesComputeService;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class TrendingInCommunitiesService {

  private final CommunityTrendingRepository trendingRepository;
  private final TrendingInCommunitiesComputeService computeService;

  @Value("${recommendation.trending-in-communities.comment-weight:2.0}")
  private double commentWeight;

  @Value("${recommendation.trending-in-communities.join-weight:0.5}")
  private double joinWeight;

  @Value("${recommendation.trending-in-communities.decay-per-hour:0.10}")
  private double decayPerHour;

  @Value("${recommendation.trending-in-communities.min-score:0.1}")
  private double minScore;

  @Value("${recommendation.trending-in-communities.fallback-window-days:60}")
  private int fallbackWindowDays;

  @Value("${recommendation.trending-in-communities.trail-size:20}")
  private int trailSize;

  @Value("${recommendation.trending-in-communities.deduplication-window-hours:24}")
  private int deduplicationWindowHours;

  /**
   * Processa um evento de comunidade para o trilho de trending. Verifica deduplicação por usuário
   * dentro da janela de 24h, aplica decaimento ao score existente e incrementa com o peso do
   * evento. Chamado pelo {@link
   * com.biblioo.recommendation.infrastructure.consumer.TrendingInCommunitiesConsumer}.
   *
   * @param eventType "message" para comentário publicado, "join" para entrada em comunidade
   */
  public void compute(Long userId, Long bookId, String eventType) {


    if (trendingRepository.hasContributedRecently(
        userId, bookId, eventType, deduplicationWindowHours)) {

      return;
    }

    double weight = "message".equals(eventType) ? commentWeight : joinWeight;

    trendingRepository.registerContribution(userId, bookId, eventType);
    trendingRepository.incrementScore(bookId, weight, decayPerHour);


  }

  /**
   * Retorna a trilha personalizada para o usuário. Camada 1 (orgânico): livros com score ativo
   * acima do limiar, filtrados pelos já lidos. Camada 2 (fallback): completa os 20 slots com os
   * livros mais bem avaliados adicionados nos últimos {@code fallbackWindowDays} dias.
   */
  @Cacheable(value = "rec-tic", key = "#userId")
  public TrendingInCommunitiesResult get(Long userId) {
    List<BookScore> organic =
        trendingRepository.findOrganicBooks(userId, minScore, decayPerHour, trailSize);

    if (organic.size() >= trailSize) {
      return new TrendingInCommunitiesResult(organic);
    }

    int fallbackNeeded = trailSize - organic.size();
    List<Long> excludeIds = organic.stream().map(BookScore::getBookId).toList();
    List<BookScore> fallback =
        computeService.computeFallback(userId, fallbackNeeded, excludeIds, fallbackWindowDays);

    List<BookScore> combined = new ArrayList<>(organic);
    combined.addAll(fallback);



    return new TrendingInCommunitiesResult(combined);
  }
}
