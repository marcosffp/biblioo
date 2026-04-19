package com.biblioo.community.infrastructure.persistence;

import com.biblioo.community.domain.model.CommunityMember;
import com.biblioo.community.domain.model.CommunityMemberId;
import com.biblioo.community.domain.model.CommunityRole;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CommunityMemberRepository
    extends JpaRepository<CommunityMember, CommunityMemberId> {

  @Query(
      "SELECT CASE WHEN COUNT(cm) > 0 THEN true ELSE false END "
          + "FROM CommunityMember cm WHERE cm.communityId = :cid AND cm.userId = :uid")
  boolean isMember(@Param("cid") Long communityId, @Param("uid") Long userId);

  @Query(
      "SELECT cm.role FROM CommunityMember cm "
          + "WHERE cm.communityId = :cid AND cm.userId = :uid")
  Optional<CommunityRole> findRole(@Param("cid") Long communityId, @Param("uid") Long userId);

  @Query(
      "SELECT cm FROM CommunityMember cm " + "WHERE cm.communityId = :cid ORDER BY cm.joinedAt ASC")
  Page<CommunityMember> findByCommunityId(@Param("cid") Long communityId, Pageable pageable);

  @Modifying
  @Query(
      "UPDATE CommunityMember cm SET cm.role = :role "
          + "WHERE cm.communityId = :cid AND cm.userId = :uid")
  void updateRole(
      @Param("cid") Long communityId, @Param("uid") Long userId, @Param("role") CommunityRole role);

  @Modifying
  @Query("DELETE FROM CommunityMember cm WHERE cm.communityId = :cid AND cm.userId = :uid")
  void removeMember(@Param("cid") Long communityId, @Param("uid") Long userId);

  @Query(
      "SELECT cm.userId FROM CommunityMember cm "
          + "WHERE cm.communityId = :cid AND cm.role IN (:roles)")
  List<Long> findUserIdsByCommunityIdAndRoleIn(
      @Param("cid") Long communityId, @Param("roles") List<CommunityRole> roles);

  @Modifying
  @Query("DELETE FROM CommunityMember cm WHERE cm.communityId = :cid")
  void deleteAllByCommunityId(@Param("cid") Long communityId);
}
