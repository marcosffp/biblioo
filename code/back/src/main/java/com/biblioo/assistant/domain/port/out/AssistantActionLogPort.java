package com.biblioo.assistant.domain.port.out;

import java.time.LocalDateTime;

public interface AssistantActionLogPort {
  void log(Long userId, String conversationId, String toolName, String paramsJson, String resultSummary);

  /**
   * Remove logs de auditoria cujo {@code created_at} é anterior ao limite informado.
   *
   * @return quantidade de logs removidos
   */
  int deleteOlderThan(LocalDateTime cutoff);
}
