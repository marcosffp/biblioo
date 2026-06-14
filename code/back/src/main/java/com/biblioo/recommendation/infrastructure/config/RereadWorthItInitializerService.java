package com.biblioo.recommendation.infrastructure.config;

import com.biblioo.recommendation.domain.service.RereadWorthItService;
import com.biblioo.recommendation.infrastructure.service.RereadWorthItComputeService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class RereadWorthItInitializerService {

  private final RereadWorthItService rereadWorthItService;
  private final RereadWorthItComputeService computeService;

  /**
   * CT-11 — Pré-computa o trilho RereadWorthIt para todos os usuários que ainda não têm
   * resultado salvo. Roda assincronamente após o contexto estar pronto para não atrasar o startup.
   * É idempotente: ignora usuários que já têm resultado.
   */
  @EventListener(ApplicationReadyEvent.class)
  @Async
  public void preComputeForExistingUsers() {

    List<Long> userIds = computeService.findUsersNeedingInitialization();

    if (userIds.isEmpty()) {
      return;
    }



    int ok = 0;
    int fail = 0;
    for (Long userId : userIds) {
      try {
        rereadWorthItService.compute(userId);
        ok++;
      } catch (Exception ex) {
        log.warn("[RWI-Init] Falha ao pré-computar userId={}: {}", userId, ex.getMessage());
        fail++;
      }
    }

  }
}
