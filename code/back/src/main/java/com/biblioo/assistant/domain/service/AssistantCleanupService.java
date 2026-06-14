package com.biblioo.assistant.domain.service;

import com.biblioo.assistant.domain.port.out.AssistantActionLogPort;
import com.biblioo.assistant.domain.port.out.AssistantConversationPort;
import java.time.LocalDateTime;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Aplica a política de retenção das conversas do assistente Bibo: remove conversas inativas e seus
 * logs de auditoria mais antigos que {@code assistant.cleanup.retention-days}.
 */
@Slf4j
@Service
public class AssistantCleanupService {

  private final AssistantConversationPort conversationPort;
  private final AssistantActionLogPort actionLogPort;
  private final int retentionDays;

  public AssistantCleanupService(
      AssistantConversationPort conversationPort,
      AssistantActionLogPort actionLogPort,
      @Value("${assistant.cleanup.retention-days}") int retentionDays) {
    this.conversationPort = conversationPort;
    this.actionLogPort = actionLogPort;
    this.retentionDays = retentionDays;
  }

  public void purgeStaleConversations() {
    LocalDateTime cutoff = LocalDateTime.now().minusDays(retentionDays);
    int conversations = conversationPort.deleteOlderThan(cutoff);
    int logs = actionLogPort.deleteOlderThan(cutoff);
    log.info(
        "Limpeza do assistente: {} conversas e {} logs de ação anteriores a {} removidos",
        conversations,
        logs,
        cutoff);
  }
}
