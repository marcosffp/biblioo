package com.biblioo.assistant.domain.port.out;

import com.biblioo.assistant.domain.model.ConversationSummary;
import com.biblioo.assistant.domain.model.ConversationTurn;
import java.util.List;

public interface AssistantConversationPort {
  void saveOrUpdate(String conversationId, Long userId, String title, List<ConversationTurn> turns);

  List<ConversationTurn> loadTurns(String conversationId);

  List<ConversationSummary> listByUser(Long userId);
}
