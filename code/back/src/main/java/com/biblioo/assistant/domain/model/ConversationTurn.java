package com.biblioo.assistant.domain.model;

public record ConversationTurn(Role role, String content) {
  public enum Role {
    USER,
    ASSISTANT
  }
}
