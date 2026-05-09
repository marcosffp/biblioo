package com.biblioo.assistant.domain.port.out;

public interface AssistantActionLogPort {
  void log(Long userId, String conversationId, String toolName, String paramsJson, String resultSummary);
}
