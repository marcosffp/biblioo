package com.biblioo.recommendation.infrastructure.persistence;

import com.biblioo.recommendation.domain.exception.DuplicateEventException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Repository
@RequiredArgsConstructor
public class EventLogRepository {

  private final EventLogJpaRepository jpaRepository;

  public boolean existsByEventId(String eventId) {
    return jpaRepository.existsByEventId(eventId);
  }

  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public void registerEvent(String eventId, String eventType, Long userId, String payload) {
    int insertedRows = jpaRepository.insertIgnoreEvent(eventId, eventType, userId, payload);

    if (insertedRows == 0) {
      log.warn(
          "[EventLog] Race condition detectada ou evento já instanciado para event_id={}, descartando",
          eventId);
      throw new DuplicateEventException(eventId);
    }
  }
}
