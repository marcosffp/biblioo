package com.biblioo.assistant.domain.port.out;

import com.biblioo.assistant.domain.model.ConversationSummary;
import com.biblioo.assistant.domain.model.ConversationTurn;
import java.time.LocalDateTime;
import java.util.List;

public interface AssistantConversationPort {
  void saveOrUpdate(String conversationId, Long userId, String title, List<ConversationTurn> turns);

  List<ConversationTurn> loadTurns(String conversationId);

  List<ConversationSummary> listByUser(Long userId);

  /**
   * Remove conversas cujo {@code updated_at} é anterior ao limite informado.
   *
   * @return quantidade de conversas removidas
   */
  int deleteOlderThan(LocalDateTime cutoff);
}
