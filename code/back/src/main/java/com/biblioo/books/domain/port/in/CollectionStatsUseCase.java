package com.biblioo.books.domain.port.in;

import com.biblioo.books.domain.model.Collection;
import com.biblioo.books.infrasestructure.dto.collection.CollectionStatisticsResponse;
import com.biblioo.books.infrasestructure.dto.collection.CollectionStatsResponse;

public interface CollectionStatsUseCase {
  CollectionStatsResponse computeStats(Collection collection);

  CollectionStatisticsResponse computeStatistics(Long userId, Long collectionId);
}
