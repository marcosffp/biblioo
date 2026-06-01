package com.biblioo.community.infrastructure.persistence;

import com.biblioo.community.domain.model.CommunityInvite;
import com.biblioo.community.domain.model.enumeration.InviteStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CommunityInviteRepository extends JpaRepository<CommunityInvite, Long> {

  @Query(
      "SELECT CASE WHEN COUNT(ci) > 0 THEN true ELSE false END "
          + "FROM CommunityInvite ci "
          + "WHERE ci.communityId = :cid AND ci.inviteeId = :uid AND ci.status = :status")
  boolean existsPending(
      @Param("cid") Long communityId,
      @Param("uid") Long inviteeId,
      @Param("status") InviteStatus status);

  @Query(
      "SELECT ci FROM CommunityInvite ci "
          + "WHERE ci.inviteeId = :uid AND ci.status = 'PENDING' "
          + "ORDER BY ci.createdAt DESC")
  Page<CommunityInvite> findPendingByInviteeId(@Param("uid") Long inviteeId, Pageable pageable);

  @Query(
      "SELECT ci FROM CommunityInvite ci "
          + "WHERE ci.communityId = :cid AND ci.inviteeId = :uid AND ci.status = 'PENDING'")
  java.util.Optional<CommunityInvite> findPendingInvite(
      @Param("cid") Long communityId, @Param("uid") Long inviteeId);

  @Modifying
  @Query("DELETE FROM CommunityInvite ci WHERE ci.communityId = :cid")
  void deleteAllByCommunityId(@Param("cid") Long communityId);
}
