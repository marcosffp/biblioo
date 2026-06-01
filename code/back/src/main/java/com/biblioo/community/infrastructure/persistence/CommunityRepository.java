package com.biblioo.community.infrastructure.persistence;

import com.biblioo.community.domain.model.Community;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CommunityRepository extends JpaRepository<Community, Long> {

  @Query("SELECT c FROM Community c WHERE c.id = :id AND c.isDeleted = false")
  Optional<Community> findActiveById(@Param("id") Long id);

  @Query("SELECT c FROM Community c WHERE c.inviteLink = :token AND c.isDeleted = false")
  Optional<Community> findActiveByInviteLink(@Param("token") String token);

  @Query(
      "SELECT c FROM Community c WHERE c.isDeleted = false "
          + "ORDER BY c.memberCount DESC, c.createdAt DESC")
  Page<Community> findAllActive(Pageable pageable);

  @Query(
      "SELECT c FROM Community c WHERE c.isDeleted = false "
          + "AND LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) "
          + "ORDER BY c.memberCount DESC")
  Page<Community> searchByName(@Param("query") String query, Pageable pageable);

  @Query(
      "SELECT c FROM Community c WHERE c.bookId = :bookId AND c.isDeleted = false "
          + "ORDER BY c.memberCount DESC")
  Page<Community> findByBookId(@Param("bookId") Long bookId, Pageable pageable);

  @Modifying
  @Query("UPDATE Community c SET c.memberCount = c.memberCount + 1 WHERE c.id = :id")
  void incrementMemberCount(@Param("id") Long id);

  @Modifying
  @Query(
      "UPDATE Community c SET c.memberCount = c.memberCount - 1 "
          + "WHERE c.id = :id AND c.memberCount > 0")
  void decrementMemberCount(@Param("id") Long id);

  @Modifying
  @Query("UPDATE Community c SET c.isDeleted = true WHERE c.id = :id")
  void softDelete(@Param("id") Long id);

  @Query(
      "SELECT c FROM Community c JOIN CommunityMember cm "
          + "ON c.id = cm.communityId WHERE cm.userId = :userId AND c.isDeleted = false "
          + "ORDER BY c.createdAt DESC")
  Page<Community> findByMemberUserId(@Param("userId") Long userId, Pageable pageable);
}
