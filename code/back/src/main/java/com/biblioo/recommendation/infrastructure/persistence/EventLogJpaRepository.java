package com.biblioo.recommendation.infrastructure.persistence;

import com.biblioo.recommendation.domain.model.RecommendationEventLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EventLogJpaRepository extends JpaRepository<RecommendationEventLog, Long> {

  boolean existsByEventId(String eventId);

  @Modifying
  @Query(
      value =
          "INSERT IGNORE INTO recommendation_event_log (event_id, event_type, user_id, payload, processed_at) VALUES (:eventId, :eventType, :userId, :payload, NOW())",
      nativeQuery = true)
  int insertIgnoreEvent(
      @Param("eventId") String eventId,
      @Param("eventType") String eventType,
      @Param("userId") Long userId,
      @Param("payload") String payload);
}
