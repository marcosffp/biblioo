package com.biblioo.books.domain.port.in;

import com.biblioo.books.infrasestructure.dto.collection.CollectionStatisticsResponse;
import com.biblioo.books.infrasestructure.dto.collection.CollectionStatsResponse;
import com.biblioo.books.domain.model.Collection;

public interface CollectionStatsUseCase {
  CollectionStatsResponse computeStats(Collection collection);
  CollectionStatisticsResponse computeStatistics(Long userId, Long collectionId);
}