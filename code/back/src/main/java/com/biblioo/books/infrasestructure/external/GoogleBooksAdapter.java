package com.biblioo.books.infrasestructure.external;

import com.biblioo.books.domain.model.Book;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class GoogleBooksAdapter {

  private final GoogleBooksApiClient apiClient;
  private final GoogleBooksMapper mapper;
  private final GoogleBooksSearchRanker ranker;

  public GoogleBooksAdapter(
      GoogleBooksApiClient apiClient, GoogleBooksMapper mapper, GoogleBooksSearchRanker ranker) {
    this.apiClient = apiClient;
    this.mapper = mapper;
    this.ranker = ranker;
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
      unless = "#result.isEmpty()")
  public List<Book> search(String query) {
    log.debug("Chamando Google Books API. query='{}'", query);

    var results1 = fetchFromApi("intitle:\"" + query + "\"");

    if (results1.size() >= 3) {
      return ranker.rankByTitleRelevance(results1, query);
    }

    String wordQuery =
        Arrays.stream(query.trim().split("\\s+"))
            .map(w -> "intitle:" + w)
            .collect(Collectors.joining("+"));

    return ranker.rankByTitleRelevance(ranker.merge(results1, fetchFromApi(wordQuery)), query);
  }

  private List<Book> fetchFromApi(String queryString) {
    return apiClient.fetch(queryString).stream()
        .map(mapper::toBook)
        .filter(Objects::nonNull)
        .collect(Collectors.toList());
  }
}
