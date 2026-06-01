package com.biblioo.community.infrastructure.persistence;

import com.biblioo.community.domain.model.BookVoting;
import com.biblioo.community.domain.model.enumeration.VotingStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookVotingRepository extends JpaRepository<BookVoting, Long> {

  Optional<BookVoting> findByIdAndCommunityId(Long id, Long communityId);

  @Query(
      "SELECT COUNT(v) > 0 FROM BookVoting v WHERE v.communityId = :communityId AND v.status = 'ACTIVE'")
  boolean existsActiveVoting(@Param("communityId") Long communityId);

  @Query(
      "SELECT COUNT(v) > 0 FROM BookVoting v WHERE v.communityId = :communityId AND v.status = 'ACTIVE' AND v.id <> :excludeId")
  boolean existsActiveVotingExcluding(
      @Param("communityId") Long communityId, @Param("excludeId") Long excludeId);

  @Query(
      "SELECT v FROM BookVoting v WHERE v.communityId = :communityId ORDER BY CASE v.status WHEN 'ACTIVE' THEN 0 WHEN 'DRAFT' THEN 1 WHEN 'CLOSED' THEN 2 WHEN 'APPROVED' THEN 3 ELSE 4 END ASC, v.createdAt DESC")
  Page<BookVoting> findByCommunityIdOrdered(
      @Param("communityId") Long communityId, Pageable pageable);

  @Query(
      "SELECT v FROM BookVoting v WHERE v.status = :status AND v.endsAt <= :now")
  List<BookVoting> findExpiredActive(
      @Param("status") VotingStatus status, @Param("now") LocalDateTime now);
}
