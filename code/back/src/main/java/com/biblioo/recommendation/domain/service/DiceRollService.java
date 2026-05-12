package com.biblioo.recommendation.domain.service;

import com.biblioo.recommendation.domain.model.BookScore;
import com.biblioo.recommendation.domain.model.DiceRollResult;
import com.biblioo.recommendation.domain.port.in.DiceRollUseCase;
import com.biblioo.recommendation.domain.port.in.RecommendationUseCase;
import com.biblioo.recommendation.infrastructure.service.DiceRollFallbackService;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class DiceRollService implements DiceRollUseCase {

  private final RecommendationUseCase recommendationUseCase;
  private final DiceRollFallbackService fallbackService;
  private final Random random = new Random();

  @Value("${recommendation.dice-roll.fallback-pool-size:50}")
  private int fallbackPoolSize;

  @Override
  public DiceRollResult rollDice(Long userId) {
    Set<Long> seen = new LinkedHashSet<>();

    addAll(seen, recommendationUseCase.getBecauseYouRead(userId).getBooks());
    addAll(seen, recommendationUseCase.getFavoriteGenreNow(userId).getBooks());
    addAll(seen, recommendationUseCase.getTrendingInCommunities(userId).getBooks());
    addAll(seen, recommendationUseCase.getCatalogSurprise(userId).getBooks());
    addAll(seen, recommendationUseCase.getRereadWorthIt(userId).getBooks());
    addAll(seen, recommendationUseCase.getSimilarAuthors(userId).getBooks());

    List<Long> pool = new ArrayList<>(seen);

    if (pool.isEmpty()) {
      pool = fallbackService.getPopularBookIds(fallbackPoolSize);
    }

    if (pool.isEmpty()) {
      log.warn("[DiceRoll] Fallback global também vazio, nenhum livro disponível");
      return new DiceRollResult(null);
    }

    Long rolled = pool.get(random.nextInt(pool.size()));
    return new DiceRollResult(rolled);
  }

  private void addAll(Set<Long> seen, List<BookScore> books) {
    books.forEach(bs -> seen.add(bs.getBookId()));
  }
}
