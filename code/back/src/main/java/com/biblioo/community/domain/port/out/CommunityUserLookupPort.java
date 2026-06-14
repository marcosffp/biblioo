package com.biblioo.community.domain.port.out;

import com.biblioo.community.infrastructure.dto.community.CommunityUserSummary;
import java.util.List;
import java.util.Map;

public interface CommunityUserLookupPort {
  boolean existsById(Long userId);

  CommunityUserSummary getById(Long userId);

  Map<Long, CommunityUserSummary> getByIds(List<Long> userIds);
}
