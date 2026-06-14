package com.biblioo.assistant.infrastructure.config;

import com.biblioo.assistant.domain.service.AssistantCleanupService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(
    name = "assistant.cleanup.enabled",
    havingValue = "true",
    matchIfMissing = true)
class AssistantCleanupScheduler {

  private final AssistantCleanupService cleanupService;

  @Scheduled(cron = "${assistant.cleanup.cron:0 0 4 * * *}")
  public void purgeStaleConversations() {
    log.debug("Executando limpeza de conversas antigas do assistente...");
    cleanupService.purgeStaleConversations();
  }
}
