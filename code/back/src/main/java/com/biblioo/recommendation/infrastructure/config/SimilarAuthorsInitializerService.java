package com.biblioo.recommendation.infrastructure.config;

import com.biblioo.recommendation.domain.service.SimilarAuthorsService;
import com.biblioo.recommendation.infrastructure.service.SimilarAuthorsComputeService;
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
public class SimilarAuthorsInitializerService {

  private final SimilarAuthorsService similarAuthorsService;
  private final SimilarAuthorsComputeService computeService;

  /**
   * CT-20 — Pré-computa o trilho SimilarAuthors para todos os usuários que ainda não têm
   * resultado salvo. Roda assincronamente após o contexto estar pronto para não atrasar o startup.
   * É idempotente: ignora usuários que já têm resultado.
   */
  @EventListener(ApplicationReadyEvent.class)
  @Async
  public void preComputeForExistingUsers() {
    log.info("[SA-Init] Iniciando pré-computação para usuários sem resultado");

    List<Long> userIds = computeService.findUsersNeedingInitialization();

    if (userIds.isEmpty()) {
      log.info("[SA-Init] Nenhum usuário precisando de inicialização");
      return;
    }

    log.info(
        "[SA-Init] {} usuários sem resultado SIMILAR_AUTHORS — iniciando pré-computação",
        userIds.size());

    int ok = 0;
    int fail = 0;
    for (Long userId : userIds) {
      try {
        similarAuthorsService.compute(userId);
        ok++;
      } catch (Exception ex) {
        log.warn("[SA-Init] Falha ao pré-computar userId={}: {}", userId, ex.getMessage());
        fail++;
      }
    }

    log.info("[SA-Init] Pré-computação concluída: ok={} falhas={}", ok, fail);
  }
}
