package com.biblioo.community.domain.port.out;

import com.biblioo.community.domain.model.CommunityUserSummary;

public interface CommunityUserLookupPort {
  boolean existsById(Long userId);

  CommunityUserSummary getById(Long userId);
}
