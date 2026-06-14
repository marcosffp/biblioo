package com.biblioo.books.infrasestructure.external;

import com.biblioo.books.domain.model.Book;
import java.util.List;
import java.util.Map;
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

  // "v2:" força o Redis a ignorar o cache antigo (gerado com a query
  // intitle:palavra+intitle:palavra
  // que era muito restritiva e ficou salvo com resultados ruins)
  @Cacheable(value = "google-books", key = "'v2:' + #query.strip().toLowerCase()", sync = true)
  public List<Book> search(String query) {
    // Fase 1: frase exata no título (alta precisão)
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

    // Fase 2: busca geral — encontra mesmo com título parcial ou idioma diferente
    var future2 =
        CompletableFuture.supplyAsync(() -> fetchFromApi(query), bookEnrichExecutor)
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

    var combined = ranker.merge(future1.getNow(List.of()), future2.getNow(List.of()));

    // Fase 3: expansão por autor principal — traz obras relacionadas do mesmo autor
    // (ex: "hobbit" → Tolkien → O Senhor dos Anéis; "harry potter" → Rowling → todos os volumes)
    String mainAuthor = extractMainAuthor(combined);
    if (mainAuthor != null) {
      var future3 =
          CompletableFuture.supplyAsync(
                  () -> fetchFromApi("inauthor:\"" + mainAuthor + "\""), bookEnrichExecutor)
              .orTimeout(3, TimeUnit.SECONDS)
              .exceptionally(
                  e -> {
                    log.warn(
                        "Google Books fase 3 (autor) timeout. author='{}'. Causa: {}",
                        mainAuthor,
                        e.getMessage());
                    return List.of();
                  });
      combined = ranker.merge(combined, future3.join());
    }

    return ranker.rankByTitleRelevance(combined, query);
  }

  private String extractMainAuthor(List<Book> books) {
    return books.stream()
        .filter(b -> b.getAuthors() != null)
        .flatMap(b -> b.getAuthors().stream())
        .filter(a -> a != null && !a.isBlank())
        .collect(Collectors.groupingBy(a -> a, Collectors.counting()))
        .entrySet()
        .stream()
        .max(Map.Entry.comparingByValue())
        .map(Map.Entry::getKey)
        .orElse(null);
  }

  private List<Book> fetchFromApi(String queryString) {
    return apiClient.fetch(queryString).stream()
        .map(mapper::toBook)
        .filter(Objects::nonNull)
        .collect(Collectors.toList());
  }
}
