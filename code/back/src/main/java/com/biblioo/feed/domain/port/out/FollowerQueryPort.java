package com.biblioo.feed.domain.port.out;

import java.util.List;

public interface FollowerQueryPort {

  long countAcceptedFollowers(Long userId);

  List<Long> findFollowerIdsBatch(Long followedId, Long afterFollowerId, int batchSize);

  List<Long> findFollowingHighVolumeAuthorIds(Long userId, long threshold);
}
