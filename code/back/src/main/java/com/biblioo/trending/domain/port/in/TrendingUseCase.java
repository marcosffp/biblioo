package com.biblioo.trending.domain.port.in;

import com.biblioo.trending.domain.model.TrendingBookItem;
import com.biblioo.trending.domain.model.TrendingCommunityItem;
import java.util.List;

public interface TrendingUseCase {
  List<TrendingCommunityItem> getTopCommunities();

  List<TrendingBookItem> getTopBooks();
}
