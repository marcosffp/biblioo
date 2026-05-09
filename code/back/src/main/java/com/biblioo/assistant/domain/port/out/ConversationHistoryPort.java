package com.biblioo.assistant.domain.port.out;

import com.biblioo.assistant.domain.model.ConversationTurn;
import java.util.List;

public interface ConversationHistoryPort {

  List<ConversationTurn> load(String conversationId);

  void save(String conversationId, List<ConversationTurn> turns);
}
