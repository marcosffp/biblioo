package com.biblioo.community.domain.port.out;

import com.biblioo.community.domain.model.CommunityBookSummary;

public interface CommunityBookLookupPort {
  boolean existsById(Long bookId);

  CommunityBookSummary getById(Long bookId);
}
