package com.biblioo.community.domain.port.out;

public interface CommunityBookLookupPort {
  boolean existsById(Long bookId);
}
