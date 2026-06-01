package com.biblioo.recommendation.infrastructure.service;

import com.biblioo.recommendation.domain.model.BookScore;
import com.biblioo.recommendation.infrastructure.persistence.RecommendationResultRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class RecommendationFallbackWriter {

  private final RecommendationResultRepository resultRepository;

  @Async
  public void persistSimilarAuthors(Long userId, List<BookScore> fallback) {
    try {
      resultRepository.upsert(userId, "SIMILAR_AUTHORS", fallback);
    } catch (Exception e) {
      log.warn("[SA] Falha ao persistir fallback async para userId={}: {}", userId, e.getMessage());
    }
  }

  @Async
  public void persistRereadWorthIt(Long userId, List<BookScore> fallback) {
    try {
      resultRepository.upsertWithRawMetadata(userId, "REREAD_WORTH_IT", fallback, "{}");
    } catch (Exception e) {
      log.warn(
          "[RWI] Falha ao persistir fallback async para userId={}: {}", userId, e.getMessage());
    }
  }
}
