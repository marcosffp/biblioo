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

  // -------------------------------------------------------------------------
  // search — ponto de entrada público
  //
  // @Cacheable com TTL de 10 min: evita chamadas duplicadas à API externa
  // para queries repetidas (ex.: enrich sync + async rodando em paralelo).
  //
  // Fases executadas em paralelo via CompletableFuture:
  //   Fase 1 — frase exata no título: intitle:"Jogos Vorazes"
  //   Fase 2 — cada palavra obrigatória: intitle:Jogos+intitle:Vorazes
  // Ambas disparam ao mesmo tempo; o merge é feito só se fase 1 retornar < 3.
  // -------------------------------------------------------------------------

  @Cacheable(
      value = "google-books",
      key = "#query.strip().toLowerCase()",
      sync = true)
  public List<Book> search(String query) {
    log.debug("Chamando Google Books API. query='{}'", query);

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
