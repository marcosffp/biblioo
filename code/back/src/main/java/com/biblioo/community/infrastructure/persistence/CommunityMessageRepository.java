package com.biblioo.community.infrastructure.persistence;

import com.biblioo.community.domain.model.CommunityMessage;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CommunityMessageRepository extends JpaRepository<CommunityMessage, Long> {

  @Query(
      value =
          "SELECT m FROM CommunityMessage m "
              + "WHERE m.communityId = :communityId AND m.deleted = false "
              + "ORDER BY m.id DESC "
              + "LIMIT :limit")
  List<CommunityMessage> findRecentByCommunityId(
      @Param("communityId") Long communityId, @Param("limit") int limit);

  @Query(
      "SELECT m FROM CommunityMessage m "
          + "WHERE m.communityId = :communityId AND m.id < :beforeId AND m.deleted = false "
          + "ORDER BY m.id DESC")
  List<CommunityMessage> findByCommunityIdBeforeId(
      @Param("communityId") Long communityId,
      @Param("beforeId") Long beforeId,
      org.springframework.data.domain.Pageable pageable);

  default List<CommunityMessage> findByCommunityIdBeforeId(
      Long communityId, Long beforeId, int limit) {
    return findByCommunityIdBeforeId(
        communityId, beforeId, org.springframework.data.domain.PageRequest.of(0, limit));
  }

  @Query(
      "SELECT m FROM CommunityMessage m "
          + "WHERE m.communityId = :communityId AND m.id > :afterId AND m.deleted = false "
          + "ORDER BY m.id ASC")
  List<CommunityMessage> findByCommunityIdAfterId(
      @Param("communityId") Long communityId, @Param("afterId") Long afterId);

  @Query(
      value =
          "SELECT m FROM CommunityMessage m "
              + "WHERE m.communityId = :communityId AND m.deleted = false "
              + "AND m.createdAt >= :joinedAt "
              + "ORDER BY m.id DESC "
              + "LIMIT :limit")
  List<CommunityMessage> findRecentByCommunityIdAndJoinedAt(
      @Param("communityId") Long communityId,
      @Param("joinedAt") LocalDateTime joinedAt,
      @Param("limit") int limit);

  @Query(
      "SELECT m FROM CommunityMessage m "
          + "WHERE m.communityId = :communityId AND m.id < :beforeId AND m.deleted = false "
          + "AND m.createdAt >= :joinedAt "
          + "ORDER BY m.id DESC")
  List<CommunityMessage> findByCommunityIdBeforeIdAndJoinedAt(
      @Param("communityId") Long communityId,
      @Param("beforeId") Long beforeId,
      @Param("joinedAt") LocalDateTime joinedAt,
      org.springframework.data.domain.Pageable pageable);

  default List<CommunityMessage> findByCommunityIdBeforeIdAndJoinedAt(
      Long communityId, Long beforeId, LocalDateTime joinedAt, int limit) {
    return findByCommunityIdBeforeIdAndJoinedAt(
        communityId, beforeId, joinedAt, org.springframework.data.domain.PageRequest.of(0, limit));
  }

  @Modifying
  @Query("UPDATE CommunityMessage m SET m.heartCount = m.heartCount + 1 WHERE m.id = :id")
  void incrementHeartCount(@Param("id") Long id);

  @Modifying
  @Query(
      "UPDATE CommunityMessage m SET m.heartCount = GREATEST(m.heartCount - 1, 0) WHERE m.id = :id")
  void decrementHeartCount(@Param("id") Long id);

  @Query("SELECT m.heartCount FROM CommunityMessage m WHERE m.id = :id")
  int findHeartCountById(@Param("id") Long id);
}
