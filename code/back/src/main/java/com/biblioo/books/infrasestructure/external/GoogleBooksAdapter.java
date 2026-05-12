package com.biblioo.books.infrasestructure.external;

import com.biblioo.books.domain.model.Book;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class GoogleBooksAdapter {

  private final GoogleBooksApiClient apiClient;
  private final GoogleBooksMapper mapper;
  private final GoogleBooksSearchRanker ranker;
  private final Executor bookEnrichExecutor;

  public GoogleBooksAdapter(
      GoogleBooksApiClient apiClient,
      GoogleBooksMapper mapper,
      GoogleBooksSearchRanker ranker,
      @Qualifier("bookEnrichExecutor") Executor bookEnrichExecutor) {
    this.apiClient = apiClient;
    this.mapper = mapper;
    this.ranker = ranker;
    this.bookEnrichExecutor = bookEnrichExecutor;
  }

  @Cacheable(value = "google-books", key = "#query.strip().toLowerCase()", sync = true)
  public List<Book> search(String query) {
    String wordQuery =
        Arrays.stream(query.trim().split("\\s+"))
            .map(w -> "intitle:" + w)
            .collect(Collectors.joining("+"));

    var future1 =
        CompletableFuture.supplyAsync(
                () -> fetchFromApi("intitle:\"" + query + "\""), bookEnrichExecutor)
            .orTimeout(4, TimeUnit.SECONDS)
            .exceptionally(
                e -> {
                  log.warn(
                      "Google Books fase 1 timeout/erro. query='{}'. Causa: {}",
                      query,
                      e.getMessage());
                  return List.of();
                });

    var future2 =
        CompletableFuture.supplyAsync(() -> fetchFromApi(wordQuery), bookEnrichExecutor)
            .orTimeout(4, TimeUnit.SECONDS)
            .exceptionally(
                e -> {
                  log.warn(
                      "Google Books fase 2 timeout/erro. query='{}'. Causa: {}",
                      query,
                      e.getMessage());
                  return List.of();
                });

    CompletableFuture.allOf(future1, future2).join();

    var results1 = future1.getNow(List.of());
    var results2 = future2.getNow(List.of());

    if (results1.size() >= 3) {
      return ranker.rankByTitleRelevance(results1, query);
    }

    return ranker.rankByTitleRelevance(ranker.merge(results1, results2), query);
  }

  private List<Book> fetchFromApi(String queryString) {
    return apiClient.fetch(queryString).stream()
        .map(mapper::toBook)
        .filter(Objects::nonNull)
        .collect(Collectors.toList());
  }
}
