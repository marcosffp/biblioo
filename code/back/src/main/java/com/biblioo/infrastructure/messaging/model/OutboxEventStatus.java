package com.biblioo.infrastructure.messaging.model;

public enum OutboxEventStatus {
  PENDING,
  PROCESSED,
  FAILED
}
