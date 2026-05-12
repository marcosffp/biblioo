package com.biblioo.community.domain.port.out;

import java.util.List;
import java.util.Map;

import com.biblioo.community.infrastructure.dto.community.CommunityUserSummary;

public interface CommunityUserLookupPort {
  boolean existsById(Long userId);

  CommunityUserSummary getById(Long userId);

  Map<Long, CommunityUserSummary> getByIds(List<Long> userIds);
}
