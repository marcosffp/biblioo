package com.biblioo.assistant.infrastructure.adapter;

import com.biblioo.assistant.domain.port.out.AssistantActionLogPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
class JdbcAssistantActionLogAdapter implements AssistantActionLogPort {

  private static final int MAX_PARAMS_LENGTH = 1000;
  private static final int MAX_RESULT_LENGTH = 500;

  private final JdbcTemplate jdbcTemplate;

  @Override
  public void log(
      Long userId,
      String conversationId,
      String toolName,
      String paramsJson,
      String resultSummary) {
    try {
      jdbcTemplate.update(
          "INSERT INTO assistant_action_log (user_id, conversation_id, tool_name, params_json, result_summary) VALUES (?, ?, ?, ?, ?)",
          userId,
          conversationId,
          toolName,
          truncate(paramsJson, MAX_PARAMS_LENGTH),
          truncate(resultSummary, MAX_RESULT_LENGTH));
    } catch (Exception e) {
      log.warn(
          "Falha ao salvar log de ação do assistente: toolName={}, erro={}", toolName, e.getMessage());
    }
  }

  private String truncate(String value, int maxLength) {
    if (value == null || value.length() <= maxLength) return value;
    return value.substring(0, maxLength);
  }
}
