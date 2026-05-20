package com.biblioo.recommendation.domain.port.in;

import com.biblioo.recommendation.domain.model.GenreTranslation;
import java.util.List;

public interface GenreUseCase {
  List<GenreTranslation> getAllGenres();
}
