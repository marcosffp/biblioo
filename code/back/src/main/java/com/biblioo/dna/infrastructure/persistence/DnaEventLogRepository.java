package com.biblioo.dna.infrastructure.persistence;

import com.biblioo.dna.domain.exception.DnaEventDuplicateException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Repository
@RequiredArgsConstructor
public class DnaEventLogRepository {

  private final DnaEventLogJpaRepository jpaRepository;

  public boolean existsByEventId(String eventId) {
    return jpaRepository.existsByEventId(eventId);
  }

  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public void registerEvent(String eventId, String eventType, Long userId, String payload) {
    int insertedRows = jpaRepository.insertIgnoreEvent(eventId, eventType, userId, payload);
    if (insertedRows == 0) {
      log.warn("[DnaEventLog] Race condition em event_id={}, descartando", eventId);
      throw new DnaEventDuplicateException(eventId);
    }
  }
}
