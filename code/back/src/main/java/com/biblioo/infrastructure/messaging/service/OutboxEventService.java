package com.biblioo.infrastructure.messaging.service;

import com.biblioo.infrastructure.messaging.model.OutboxEvent;
import com.biblioo.infrastructure.messaging.model.OutboxEventStatus;
import com.biblioo.infrastructure.messaging.persistence.OutboxEventRepository;
import com.biblioo.infrastructure.messaging.port.EventPublisherPort;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Service
@RequiredArgsConstructor
public class OutboxEventService {

  private final OutboxEventRepository outboxEventRepository;
  private final EventPublisherPort eventPublisherPort;
  private final ObjectMapper objectMapper;

  @Transactional(propagation = Propagation.MANDATORY)
  public OutboxEvent saveAndSchedulePublish(
      String eventType, String aggregateType, String aggregateId, String routingKey) {
    return saveAndSchedulePublish(eventType, aggregateType, aggregateId, routingKey, null);
  }

  @Transactional(propagation = Propagation.MANDATORY)
  public OutboxEvent saveAndSchedulePublish(
      String eventType,
      String aggregateType,
      String aggregateId,
      String routingKey,
      Object payloadObj) {

    String payloadStr = "{}";
    if (payloadObj != null) {
      try {
        payloadStr = objectMapper.writeValueAsString(payloadObj);
      } catch (Exception e) {
        throw new IllegalArgumentException("Falha ao serializar payload do OutboxEvent: " + e.getMessage());
      }
    }

    OutboxEvent event =
        OutboxEvent.builder()
            .id(UUID.randomUUID().toString())
            .eventType(eventType)
            .aggregateType(aggregateType)
            .aggregateId(aggregateId)
            .routingKey(routingKey)
            .payload(payloadStr)
            .status(OutboxEventStatus.PENDING)
            .build();

    OutboxEvent saved = outboxEventRepository.save(event);

    TransactionSynchronizationManager.registerSynchronization(
        new TransactionSynchronization() {
          @Override
          public void afterCommit() {
            eventPublisherPort.publish(saved);
          }
        });

    return saved;
  }

  @Transactional
  public void markAsProcessed(String eventId) {
    outboxEventRepository.updateStatus(eventId, OutboxEventStatus.PROCESSED, LocalDateTime.now());
  }

  @Transactional
  public void markAsFailed(String eventId, String errorMessage) {
    outboxEventRepository.markAsFailed(eventId, OutboxEventStatus.FAILED, errorMessage);
  }

  @Transactional(readOnly = true)
  public boolean isAlreadyProcessed(String eventId) {
    return outboxEventRepository
        .findById(eventId)
        .map(e -> e.getStatus() == OutboxEventStatus.PROCESSED)
        .orElse(false);
  }
}
