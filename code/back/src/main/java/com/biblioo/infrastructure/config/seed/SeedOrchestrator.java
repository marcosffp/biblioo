package com.biblioo.infrastructure.config.seed;

import com.biblioo.user.domain.model.User;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * Orquestra o seed de dados de demonstração, chamando o serviço de cada módulo na ordem correta de
 * dependências (livros → usuários → bibliotecas → follows → comunidades → feed).
 *
 * <p>Só é ativado quando {@code biblioo.seed.enabled=true}. Por padrão fica desligado, garantindo
 * que o seed nunca rode em produção. Cada serviço é idempotente: rodar o seed mais de uma vez não
 * duplica dados.
 */
@Component
@ConditionalOnProperty(prefix = "biblioo.seed", name = "enabled", havingValue = "true")
@Slf4j
@RequiredArgsConstructor
public class SeedOrchestrator {

  private final BookSeedService bookSeedService;
  private final UserSeedService userSeedService;
  private final LibrarySeedService librarySeedService;
  private final FollowSeedService followSeedService;
  private final CommunitySeedService communitySeedService;
  private final FeedSeedService feedSeedService;

  @EventListener(ApplicationReadyEvent.class)
  @Async
  public void run() {
    long startedAt = System.currentTimeMillis();
    log.info("[Seed] Iniciando população de dados de demonstração...");

    try {
      List<Long> bookIds = bookSeedService.fetchBooks();
      if (bookIds.isEmpty()) {
        log.warn("[Seed] Nenhum livro disponível. Seed abortado.");
        return;
      }

      List<User> users = userSeedService.ensureUsers();
      if (users.isEmpty()) {
        log.warn("[Seed] Nenhum usuário disponível. Seed abortado.");
        return;
      }

      librarySeedService.populateLibraries(users, bookIds);
      followSeedService.createFollows(users);
      communitySeedService.seedCommunities(users, bookIds);
      feedSeedService.seedFeed(users, bookIds);

      log.info(
          "[Seed] Concluído em {} ms — {} usuários, {} livros, {} comunidades.",
          System.currentTimeMillis() - startedAt,
          users.size(),
          bookIds.size(),
          CommunitySeedService.communityCount());
    } catch (Exception e) {
      log.error("[Seed] Falha inesperada durante o seed: {}", e.getMessage(), e);
    }
  }
}
