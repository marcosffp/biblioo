package com.biblioo.infrastructure.messaging.persistence;

import com.biblioo.infrastructure.messaging.model.OutboxEvent;
import com.biblioo.infrastructure.messaging.model.OutboxEventStatus;
import java.time.LocalDateTime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface OutboxEventRepository extends JpaRepository<OutboxEvent, String> {

  @Modifying
  @Query(
      """
      UPDATE OutboxEvent o
      SET o.status       = :status,
          o.processedAt  = :processedAt,
          o.attempts     = o.attempts + 1
      WHERE o.id = :id
      """)
  void updateStatus(
      @Param("id") String id,
      @Param("status") OutboxEventStatus status,
      @Param("processedAt") LocalDateTime processedAt);

  @Modifying
  @Query(
      """
      UPDATE OutboxEvent o
      SET o.status       = :status,
          o.errorMessage = :errorMessage,
          o.attempts     = o.attempts + 1
      WHERE o.id = :id
      """)
  void markAsFailed(
      @Param("id") String id,
      @Param("status") OutboxEventStatus status,
      @Param("errorMessage") String errorMessage);
}
