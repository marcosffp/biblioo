package com.biblioo.assistant.infrastructure.adapter;

import com.biblioo.assistant.domain.model.ConversationSummary;
import com.biblioo.assistant.domain.model.ConversationTurn;
import com.biblioo.assistant.domain.port.out.AssistantConversationPort;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
class JdbcAssistantConversationAdapter implements AssistantConversationPort {

  private static final TypeReference<List<ConversationTurn>> LIST_TYPE = new TypeReference<>() {};

  private final JdbcTemplate jdbcTemplate;
  private final ObjectMapper objectMapper;

  @Override
  public void saveOrUpdate(
      String conversationId, Long userId, String title, List<ConversationTurn> turns) {
    try {
      String json = objectMapper.writeValueAsString(turns);
      jdbcTemplate.update(
          """
          INSERT INTO assistant_conversation (id, user_id, title, history_json)
          VALUES (?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE history_json = VALUES(history_json), updated_at = NOW(3)
          """,
          conversationId,
          userId,
          title,
          json);
    } catch (Exception e) {
      log.error("Falha ao persistir conversa no MySQL: {}", e.getMessage());
    }
  }

  @Override
  public List<ConversationTurn> loadTurns(String conversationId) {
    try {
      List<String> rows =
          jdbcTemplate.queryForList(
              "SELECT history_json FROM assistant_conversation WHERE id = ?",
              String.class,
              conversationId);
      if (rows.isEmpty()) return List.of();
      return objectMapper.readValue(rows.get(0), LIST_TYPE);
    } catch (Exception e) {
      log.warn("Falha ao carregar histórico do MySQL: {}", e.getMessage());
      return List.of();
    }
  }

  @Override
  public List<ConversationSummary> listByUser(Long userId) {
    return jdbcTemplate.query(
        "SELECT id, title, created_at, updated_at FROM assistant_conversation WHERE user_id = ? ORDER BY updated_at DESC",
        (rs, row) ->
            new ConversationSummary(
                rs.getString("id"),
                rs.getString("title"),
                rs.getObject("created_at", LocalDateTime.class),
                rs.getObject("updated_at", LocalDateTime.class)),
        userId);
  }

  @Override
  public int deleteOlderThan(LocalDateTime cutoff) {
    return jdbcTemplate.update("DELETE FROM assistant_conversation WHERE updated_at < ?", cutoff);
  }
}
