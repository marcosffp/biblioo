package com.biblioo.community.infrastructure.persistence;

import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class CommunityMembershipCache {

  private final CommunityMemberRepository memberRepository;

  // @Transactional garante que a conexão é liberada ao pool antes de retornar ao
  // CacheInterceptor, evitando que a conexão fique presa durante uploads externos (Cloudinary).
  @Cacheable(value = "community-membership", key = "#communityId + ':' + #userId")
  @Transactional(readOnly = true)
  public boolean isMember(Long communityId, Long userId) {
    return memberRepository.isMember(communityId, userId);
  }

  @CacheEvict(value = "community-membership", key = "#communityId + ':' + #userId")
  public void evict(Long communityId, Long userId) {}
}
