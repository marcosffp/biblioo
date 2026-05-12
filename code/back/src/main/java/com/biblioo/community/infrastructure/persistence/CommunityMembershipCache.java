package com.biblioo.community.infrastructure.persistence;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import com.biblioo.community.domain.exception.CommunityAccessDeniedException;


@Component
@RequiredArgsConstructor
public class CommunityMembershipCache {

  private final CommunityMemberRepository memberRepository;
  private final org.springframework.cache.CacheManager cacheManager;

  private static final String CACHE_NAME = "community-membership";

  public boolean isMember(Long communityId, Long userId) {
    String key = communityId + ":" + userId;
    org.springframework.cache.Cache cache = cacheManager.getCache(CACHE_NAME);

    if (cache != null) {
      org.springframework.cache.Cache.ValueWrapper cached = cache.get(key);
      if (cached != null) {
        return (Boolean) cached.get();
      }
    }

    // A query abre conexão, executa, fecha conexão — tudo aqui, antes de
    // qualquer coisa externa acontecer
    boolean result = memberRepository.isMember(communityId, userId);

    if (cache != null) {
      cache.put(key, result); // grava no cache DEPOIS que a conexão foi fechada
    }

    return result;
  }

  public void evict(Long communityId, Long userId) {
    org.springframework.cache.Cache cache = cacheManager.getCache(CACHE_NAME);
    if (cache != null) {
      cache.evict(communityId + ":" + userId);
    }
  }

  public void requireMember(Long communityId, Long userId) {
  if (!isMember(communityId, userId)) {
    throw new CommunityAccessDeniedException(
        "Acesso negado: você não é membro desta comunidade.");
  }
}
}