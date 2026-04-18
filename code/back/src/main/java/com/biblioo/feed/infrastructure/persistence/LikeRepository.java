package com.biblioo.feed.infrastructure.persistence;

import com.biblioo.feed.domain.model.Like;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {

  boolean existsByContentIdAndUserId(Long contentId, Long userId);

  @Modifying
  @Query("DELETE FROM Like l WHERE l.contentId = :contentId AND l.userId = :userId")
  int deleteByContentIdAndUserId(@Param("contentId") Long contentId, @Param("userId") Long userId);
}
