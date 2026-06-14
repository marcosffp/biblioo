package com.biblioo.user.infrastructure.persistence;

import com.biblioo.user.domain.model.PasswordResetToken;
import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

  @Query("SELECT t FROM PasswordResetToken t WHERE t.token = :token")
  Optional<PasswordResetToken> findByToken(@Param("token") String token);

  @Query(
      "SELECT COUNT(t) FROM PasswordResetToken t"
          + " WHERE t.userId = :userId AND t.createdAt > :since")
  long countRecentRequests(@Param("userId") Long userId, @Param("since") LocalDateTime since);
}
