package com.biblioo.user.infrastructure.persistence;

import com.biblioo.user.domain.model.RefreshToken;
import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

  @Query("SELECT t FROM RefreshToken t WHERE t.token = :token")
  Optional<RefreshToken> findByToken(@Param("token") String token);

  @Modifying
  @Transactional
  @Query("DELETE FROM RefreshToken t WHERE t.userId = :userId")
  void deleteAllByUserId(@Param("userId") Long userId);

  @Modifying
  @Transactional
  @Query(
      "DELETE FROM RefreshToken t WHERE t.userId = :userId"
          + " AND (t.used = true OR t.expiresAt < :now)")
  void deleteExpiredOrUsedByUserId(@Param("userId") Long userId, @Param("now") LocalDateTime now);

  /** Atalho que injeta o timestamp atual — use em chamadas de limpeza rotineiras. */
  default void deleteExpiredOrUsed(Long userId) {
    deleteExpiredOrUsedByUserId(userId, LocalDateTime.now());
  }
}
