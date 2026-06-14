package com.biblioo.infrastructure.config;

import com.biblioo.books.infrasestructure.persistence.BookRepository;
import com.biblioo.user.infrastructure.persistence.UserRepository;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.opensearch.client.opensearch.OpenSearchClient;
import org.opensearch.client.opensearch.core.bulk.BulkOperation;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "opensearch.cleanup.enabled", havingValue = "true", matchIfMissing = true)
public class OpenSearchIndexCleanupService {

  private static final String BOOKS_INDEX = "books";
  private static final String USERS_INDEX = "users";
  private static final int SCROLL_SIZE = 500;

  private final OpenSearchClient client;
  private final BookRepository bookRepository;
  private final UserRepository userRepository;

  @Scheduled(cron = "${opensearch.cleanup.cron:0 0 3 * * SUN}")
  public void cleanup() {
    logIndexStats();
    removeOrphanedBooks();
    removeOrphanedUsers();
  }

  @Scheduled(cron = "${opensearch.stats.cron:0 0 * * * *}")
  public void logIndexStats() {
    try {
      var stats = client.indices().stats(s -> s.index(List.of(BOOKS_INDEX, USERS_INDEX)));
      stats.indices().forEach((index, indexStats) -> {
      });
    } catch (Exception e) {
    }
  }

  private void removeOrphanedBooks() {
    try {
      Set<Long> mysqlIds = new HashSet<>(bookRepository.findAllIds());
      List<String> orphans = collectOrphans(BOOKS_INDEX, mysqlIds);
      if (!orphans.isEmpty()) {
        bulkDelete(BOOKS_INDEX, orphans);
      }
    } catch (Exception e) {
      log.warn("Falha no cleanup do índice books. Tentará novamente no próximo ciclo. Causa: {}", e.getMessage());
    }
  }

  private void removeOrphanedUsers() {
    try {
      Set<Long> mysqlIds = new HashSet<>(userRepository.findAllIds());
      List<String> orphans = collectOrphans(USERS_INDEX, mysqlIds);
      if (!orphans.isEmpty()) {
        bulkDelete(USERS_INDEX, orphans);
      }
    } catch (Exception e) {
      log.warn("Falha no cleanup do índice users. Tentará novamente no próximo ciclo. Causa: {}", e.getMessage());
    }
  }

  private List<String> collectOrphans(String indexName, Set<Long> mysqlIds) throws IOException {
    List<String> orphans = new ArrayList<>();
    String scrollId = null;

    try {
      var response = client.search(
          s -> s.index(indexName)
                .source(src -> src.fetch(false))
                .size(SCROLL_SIZE)
                .scroll(t -> t.time("2m"))
                .query(q -> q.matchAll(m -> m)),
          Void.class);

      scrollId = response.scrollId();
      var hits = response.hits().hits();

      while (!hits.isEmpty()) {
        for (var hit : hits) {
          try {
            if (!mysqlIds.contains(Long.parseLong(hit.id()))) {
              orphans.add(hit.id());
            }
          } catch (NumberFormatException ignored) {
            orphans.add(hit.id());
          }
        }

        String sid = scrollId;
        response = client.scroll(
            sr -> sr.scrollId(sid).scroll(t -> t.time("2m")),
            Void.class);
        scrollId = response.scrollId();
        hits = response.hits().hits();
      }
    } finally {
      if (scrollId != null) {
        String sid = scrollId;
        try { client.clearScroll(cs -> cs.scrollId(sid)); } catch (Exception ignored) {}
      }
    }

    return orphans;
  }

  private void bulkDelete(String indexName, List<String> ids) throws IOException {
    var ops = ids.stream()
        .map(id -> BulkOperation.of(op -> op.delete(d -> d.index(indexName).id(id))))
        .toList();
    client.bulk(b -> b.operations(ops));
  }

  private record Void() {}
}
