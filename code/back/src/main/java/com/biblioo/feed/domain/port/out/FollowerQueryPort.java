package com.biblioo.feed.domain.port.out;

import java.util.List;

public interface FollowerQueryPort {

  long countAcceptedFollowers(Long userId);

  /** Retorna IDs de seguidores aceitos de {@code followedId} com followerId > {@code afterFollowerId}, até {@code batchSize} resultados. */
  List<Long> findFollowerIdsBatch(Long followedId, Long afterFollowerId, int batchSize);

  /** Retorna IDs de usuários seguidos por {@code userId} cujo número de seguidores >= {@code threshold}. */
  List<Long> findFollowingHighVolumeAuthorIds(Long userId, long threshold);
}
