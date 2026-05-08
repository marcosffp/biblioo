package com.biblioo.trending.domain.port.out;

import com.biblioo.trending.domain.model.TrendingBookItem;
import com.biblioo.trending.domain.model.TrendingCommunityItem;
import java.util.List;

public interface TrendingComputePort {
  List<TrendingCommunityItem> computeTopCommunities();

  List<TrendingBookItem> computeTopBooks();
}
