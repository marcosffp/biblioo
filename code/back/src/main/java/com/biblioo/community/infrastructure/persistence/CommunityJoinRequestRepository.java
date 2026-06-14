package com.biblioo.community.infrastructure.persistence;

import com.biblioo.community.domain.model.CommunityJoinRequest;
import com.biblioo.community.domain.model.enumeration.JoinRequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CommunityJoinRequestRepository extends JpaRepository<CommunityJoinRequest, Long> {

  @Query(
      "SELECT CASE WHEN COUNT(cjr) > 0 THEN true ELSE false END "
          + "FROM CommunityJoinRequest cjr "
          + "WHERE cjr.communityId = :cid AND cjr.userId = :uid AND cjr.status = :status")
  boolean existsPending(
      @Param("cid") Long communityId,
      @Param("uid") Long userId,
      @Param("status") JoinRequestStatus status);

  @Query(
      "SELECT cjr FROM CommunityJoinRequest cjr "
          + "WHERE cjr.communityId = :cid AND cjr.status = 'PENDING' "
          + "ORDER BY cjr.createdAt ASC")
  Page<CommunityJoinRequest> findPendingByCommunityId(
      @Param("cid") Long communityId, Pageable pageable);

  @Modifying
  @Query("DELETE FROM CommunityJoinRequest cjr WHERE cjr.communityId = :cid")
  void deleteAllByCommunityId(@Param("cid") Long communityId);
}
