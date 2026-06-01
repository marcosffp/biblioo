package com.biblioo.feed.infrastructure.persistence;

import com.biblioo.feed.domain.port.out.FollowerQueryPort;
import com.biblioo.user.infrastructure.persistence.UserFollowRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class FollowerQueryAdapter implements FollowerQueryPort {

  private final UserFollowRepository userFollowRepository;

  @Override
  @Transactional(readOnly = true)
  public long countAcceptedFollowers(Long userId) {
    return userFollowRepository.countAcceptedFollowers(userId);
  }

  @Override
  @Transactional(readOnly = true)
  public List<Long> findFollowerIdsBatch(Long followedId, Long afterFollowerId, int batchSize) {
    return userFollowRepository.findFollowerIdsBatch(
        followedId, afterFollowerId, PageRequest.of(0, batchSize));
  }

  @Override
  @Cacheable(value = "feed-high-volume-authors", key = "#userId + '_' + #threshold")
  @Transactional(readOnly = true)
  public List<Long> findFollowingHighVolumeAuthorIds(Long userId, long threshold) {
    return userFollowRepository.findFollowingIdsAboveThreshold(userId, threshold);
  }
}
