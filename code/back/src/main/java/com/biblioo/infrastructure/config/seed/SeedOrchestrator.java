package com.biblioo.infrastructure.config.seed;

import com.biblioo.user.domain.model.User;
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
    log.info("[Seed] Verificando e populando dados de seed...");

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

    log.info("[Seed] Seed concluído. {} usuários, {} livros, 8 comunidades.", users.size(), bookIds.size());
  }
}
