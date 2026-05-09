package com.biblioo.feed.domain.service;

import com.biblioo.feed.infrastructure.persistence.LikeRepository;
import java.util.Collection;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class LikeStatusResolver {

  private final LikeRepository likeRepository;

  public Set<Long> resolve(Long userId, Collection<Long> contentIds) {
    if (userId == null || contentIds == null || contentIds.isEmpty()) return Set.of();
    return likeRepository.findLikedContentIds(contentIds, userId);
  }

  public boolean isLiked(Long userId, Long contentId) {
    if (userId == null) return false;
    return likeRepository.existsByContentIdAndUserId(contentId, userId);
  }
}
