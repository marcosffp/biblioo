package com.biblioo.recommendation.domain.port.in;

import com.biblioo.recommendation.domain.model.BookScore;
import java.util.List;

public interface RecommendationUseCase {

  List<BookScore> getBecauseYouRead(Long userId);
}
