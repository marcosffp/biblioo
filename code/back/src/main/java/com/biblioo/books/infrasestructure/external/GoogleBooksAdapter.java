package com.biblioo.books.infrasestructure.external;

import com.biblioo.books.domain.model.Book;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.time.temporal.ChronoField;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.retry.support.RetryTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Slf4j
@Component
public class GoogleBooksAdapter {

  private static final String BASE_URL = "https://www.googleapis.com/books/v1";
  private static final int MAX_RESULTS = 15;

  private static final DateTimeFormatter FLEXIBLE_DATE =
      new DateTimeFormatterBuilder()
          .appendPattern("yyyy")
          .optionalStart()
          .appendLiteral('-')
          .appendPattern("MM")
          .optionalEnd()
          .optionalStart()
          .appendLiteral('-')
          .appendPattern("dd")
          .optionalEnd()
          .parseDefaulting(ChronoField.MONTH_OF_YEAR, 1)
          .parseDefaulting(ChronoField.DAY_OF_MONTH, 1)
          .toFormatter();

  private final RestClient restClient;
  private final String apiKey;
  private final RetryTemplate retryTemplate;

  public GoogleBooksAdapter(
      @Value("${google.books.api-key}") String apiKey, RetryTemplate retryTemplate) {
    this.apiKey = apiKey;
    this.retryTemplate = retryTemplate;
    this.restClient =
        RestClient.builder().baseUrl(BASE_URL).defaultHeader("Accept", "application/json").build();
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
      return rankByTitleRelevance(results1, query);
    }

    String wordQuery =
        Arrays.stream(query.trim().split("\\s+"))
            .map(w -> "intitle:" + w)
            .collect(Collectors.joining("+"));

    return rankByTitleRelevance(merge(results1, fetchFromApi(wordQuery)), query);
  }

  private List<Book> fetchFromApi(String queryString) {
    return retryTemplate.execute(
        ctx -> {
          if (ctx.getRetryCount() > 0) {
            log.debug(
                "Retentativa {} para Google Books. query='{}'", ctx.getRetryCount(), queryString);
          }
          GoogleBooksResponse response =
              restClient
                  .get()
                  .uri(
                      uri ->
                          uri.path("/volumes")
                              .queryParam("q", queryString)
                              .queryParam("maxResults", MAX_RESULTS)
                              .queryParam("printType", "books")
                              .queryParam("langRestrict", "pt")
                              .queryParam("orderBy", "relevance")
                              .queryParam("key", apiKey)
                              .build())
                  .retrieve()
                  .body(GoogleBooksResponse.class);

          if (response == null || response.items() == null) return List.of();

          return response.items().stream().map(this::toBook).filter(Objects::nonNull).toList();
        },
        ctx -> {
          log.warn(
              "Falha na chamada Google Books após {} tentativas. query='{}'. Causa: {}",
              ctx.getRetryCount(),
              queryString,
              ctx.getLastThrowable() != null
                  ? ctx.getLastThrowable().getMessage()
                  : "desconhecida");
          return List.of();
        });
  }

  private List<Book> merge(List<Book> primary, List<Book> secondary) {
    var seen =
        primary.stream().map(Book::getIsbn).filter(Objects::nonNull).collect(Collectors.toSet());

    var merged = new ArrayList<>(primary);
    secondary.stream()
        .filter(b -> b.getIsbn() == null || seen.add(b.getIsbn()))
        .forEach(merged::add);
    return merged;
  }

  private List<Book> rankByTitleRelevance(List<Book> books, String query) {
    String q = query.toLowerCase(Locale.ROOT).trim();
    String[] words = q.split("\\s+");

    return books.stream()
        .filter(b -> !isGenericOrLowQuality(b))
        .map(b -> Map.entry(b, titleScore(b.getTitle(), q, words)))
        .filter(e -> e.getValue() > 0)
        .sorted(Map.Entry.<Book, Integer>comparingByValue().reversed())
        .map(Map.Entry::getKey)
        .limit(MAX_RESULTS)
        .toList();
  }

  private boolean isGenericOrLowQuality(Book b) {
    if (b == null || b.getTitle() == null) return true;

    String title = b.getTitle().toLowerCase(Locale.ROOT);

    if (isLikelyNotebookOrManual(title)) return true;
    if (isLikelyNoise(b)) return true;

    return false;
  }

  private boolean isLikelyNotebookOrManual(String title) {
    String[] genericPatterns = {
      "caderno", "notebook", "manual", "guia", "guide", "apostila", "artigo", "article"
    };

    for (String pattern : genericPatterns) {
      if (title.contains(pattern)) {
        return true;
      }
    }

    return false;
  }

  private boolean isLikelyNoise(Book b) {
    if ((b.getDescription() == null || b.getDescription().length() < 20)
        && b.getPageCount() != null
        && b.getPageCount() < 10) {
      return true;
    }

    return false;
  }

  /**
   * Pontuação crescente por grau de correspondência entre título e query: 100 — título idêntico à
   * query 90 — título começa com a query 80 — título contém a frase exata 70 — título contém todas
   * as palavras 40 — título contém pelo menos metade das palavras 10 — título contém ao menos uma
   * palavra 0 — nenhuma palavra presente → descartado
   */
  private int titleScore(String title, String normalizedQuery, String[] words) {
    if (title == null) return 0;
    String t = title.toLowerCase(Locale.ROOT);

    if (t.equals(normalizedQuery)) return 100;
    if (t.startsWith(normalizedQuery)) return 90;
    if (t.contains(normalizedQuery)) return 80;

    long hits = Arrays.stream(words).filter(t::contains).count();
    if (hits == words.length) return 70;
    if (hits >= Math.ceil(words.length / 2.0)) return 40;
    if (hits > 0) return 10;
    return 0;
  }

  private Book toBook(VolumeItem item) {
    if (item == null || item.volumeInfo() == null) return null;

    VolumeInfo info = item.volumeInfo();
    if (info.title() == null || extractIsbn(info) == null) return null;

    return Book.builder()
        .isbn(extractIsbn(info))
        .title(info.title())
        .authors(info.authors() != null ? info.authors() : List.of())
        .publisher(info.publisher())
        .publishedAt(parseDate(info.publishedDate()))
        .description(info.description())
        .coverUrl(extractCoverUrl(info))
        .pageCount(info.pageCount())
        .averageRating(info.averageRating())
        .ratingCount(info.ratingsCount())
        .language(info.language())
        .source("GOOGLE_BOOKS")
        .categories(List.of())
        .build();
  }

  private String extractIsbn(VolumeInfo info) {
    if (info.industryIdentifiers() == null) return null;

    log.info(
        info.industryIdentifiers().stream()
            .map(id -> id.type() + ":" + id.identifier())
            .collect(Collectors.joining(", ", "IDs encontrados: [", "]")));

    String isbn13 =
        info.industryIdentifiers().stream()
            .filter(id -> "ISBN_13".equals(id.type()))
            .map(IndustryIdentifier::identifier)
            .findFirst()
            .orElse(null);

    if (isbn13 != null) return isbn13;

    return info.industryIdentifiers().stream()
        .filter(id -> "ISBN_10".equals(id.type()))
        .map(IndustryIdentifier::identifier)
        .findFirst()
        .orElse(null);
  }

  private String extractCoverUrl(VolumeInfo info) {
    if (info.imageLinks() == null) return null;

    String url =
        info.imageLinks()
            .getOrDefault(
                "extraLarge",
                info.imageLinks()
                    .getOrDefault("large", info.imageLinks().getOrDefault("thumbnail", null)));

    return url != null ? url.replace("http://", "https://") : null;
  }

  private LocalDate parseDate(String raw) {
    if (raw == null || raw.isBlank()) return null;
    try {
      return LocalDate.parse(raw.trim(), FLEXIBLE_DATE);
    } catch (Exception e) {
      log.debug("publishedDate ignorada — formato inesperado: '{}'", raw);
      return null;
    }
  }

  record GoogleBooksResponse(int totalItems, List<VolumeItem> items) {}

  record VolumeItem(String id, VolumeInfo volumeInfo) {}

  record VolumeInfo(
      String title,
      List<String> authors,
      String publisher,
      String publishedDate,
      String description,
      List<IndustryIdentifier> industryIdentifiers,
      Integer pageCount,
      List<String> categories,
      Float averageRating,
      Integer ratingsCount,
      String language,
      Map<String, String> imageLinks) {}

  record IndustryIdentifier(String type, String identifier) {}
}
