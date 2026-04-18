package com.biblioo.community.infrastructure.dto;

public record MessageEventPayload(String eventType, MessageResponse data) {

  public static final String MESSAGE_CREATED = "MESSAGE_CREATED";
  public static final String MESSAGE_UPDATED = "MESSAGE_UPDATED";
  public static final String MESSAGE_DELETED = "MESSAGE_DELETED";
  public static final String REACTION_UPDATED = "REACTION_UPDATED";
}
