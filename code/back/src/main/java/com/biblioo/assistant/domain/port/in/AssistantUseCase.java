package com.biblioo.assistant.domain.port.in;

import com.biblioo.assistant.domain.model.AssistantResponse;
import com.biblioo.assistant.domain.model.ConversationSummary;
import java.util.List;

public interface AssistantUseCase {

  /**
   * Processa a mensagem do usuário, executa ferramentas via function calling e retorna a resposta
   * do Bibo.
   *
   * @param userId ID do usuário autenticado — nunca exposto ao modelo
   * @param userMessage mensagem do usuário (já sanitizada)
   * @param conversationId ID da conversa para manter histórico no Redis (null = nova conversa)
   */
  AssistantResponse chat(Long userId, String userMessage, String conversationId);

  List<ConversationSummary> listConversations(Long userId);
}
