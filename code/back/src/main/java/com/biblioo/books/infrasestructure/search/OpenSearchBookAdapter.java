package com.biblioo.books.infrasestructure.search;

import com.biblioo.books.domain.model.Book;
import com.biblioo.books.infrasestructure.persistence.BookRepository;
import java.io.IOException;
import java.util.List;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.opensearch.client.opensearch.OpenSearchClient;
import org.opensearch.client.opensearch._types.query_dsl.BoolQuery;
import org.opensearch.client.opensearch._types.query_dsl.MatchPhrasePrefixQuery;
import org.opensearch.client.opensearch._types.query_dsl.MultiMatchQuery;
import org.opensearch.client.opensearch._types.query_dsl.TextQueryType;
import org.opensearch.client.opensearch.core.IndexRequest;
import org.opensearch.client.opensearch.core.SearchRequest;
import org.opensearch.client.opensearch.core.bulk.BulkOperation;
import org.opensearch.client.opensearch.core.bulk.IndexOperation;
import org.opensearch.client.opensearch.core.search.Hit;
import org.opensearch.client.transport.endpoints.BooleanResponse;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Recover;
import org.springframework.retry.annotation.Retryable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class OpenSearchBookAdapter {

  private static final String INDEX_NAME = "books";
  private static final int MAX_SEARCH_RESULTS = 15;
  private static final int MAX_SUGGEST_RESULTS = 8;

  private final OpenSearchClient client;
  private final BookRepository repository;

  @Retryable(
      retryFor = RuntimeException.class,
      maxAttempts = 2,
      backoff = @Backoff(delay = 50),
      recover = "searchFallback")
  public List<Book> search(String query) {
    try {
      // Para queries curtas (≤3 termos): todos devem estar presentes.
      // Para queries longas (>3 termos): 75% dos termos devem corresponder.
      // Isso evita que "harry potter e a pedra filosofal" exija os 6 tokens em
      // um único campo — o que falha quando o título está armazenado em inglês.
      var mustClause =
          MultiMatchQuery.of(
              mm ->
                  mm.query(query)
                      .fields("title^10", "authors^3", "isbn^8", "description^2", "searchText^1")
                      .operator(org.opensearch.client.opensearch._types.query_dsl.Operator.Or)
                      .type(TextQueryType.BestFields)
                      .minimumShouldMatch("3<75%"));

      // Bônus de score se os termos aparecerem como frase no título
      var phraseTitleBoost =
          MatchPhrasePrefixQuery.of(mp -> mp.field("title").query(query).boost(5.0f));

      var boolQuery =
          BoolQuery.of(
              bq ->
                  bq.must(m -> m.multiMatch(mustClause))
                    .should(s -> s.matchPhrasePrefix(phraseTitleBoost)));

      var request =
          SearchRequest.of(
              sr ->
                  sr.index(INDEX_NAME)
                      .query(q -> q.bool(boolQuery))
                      .size(MAX_SEARCH_RESULTS));

      var response = client.search(request, BookDocument.class);

      return response.hits().hits().stream()
          .map(Hit::source)
          .filter(Objects::nonNull)
          .map(BookDocument::toBook)
          .collect(java.util.stream.Collectors.toList());

    } catch (IOException e) {
      throw new RuntimeException("OpenSearch search falhou", e);
    }
  }

  @Recover
  public List<Book> searchFallback(RuntimeException e, String query) {
    log.warn(
        "OpenSearch indisponível durante search após 2 tentativas. query='{}'. Causa: {}",
        query,
        e.getCause() != null ? e.getCause().getMessage() : e.getMessage());
    return List.of();
  }

  @Retryable(
      retryFor = RuntimeException.class,
      maxAttempts = 2,
      backoff = @Backoff(delay = 50),
      recover = "suggestFallback")
  public List<Book> suggest(String query) {
    try {
      var prefixQuery = MatchPhrasePrefixQuery.of(mp -> mp.field("title").query(query));

      var request =
          SearchRequest.of(
              sr ->
                  sr.index(INDEX_NAME)
                      .query(q -> q.matchPhrasePrefix(prefixQuery))
                      .size(MAX_SUGGEST_RESULTS)
                      .source(
                          s -> s.filter(f -> f.includes("isbn", "title", "authors", "coverUrl"))));

      var response = client.search(request, BookDocument.class);

      return response.hits().hits().stream()
          .map(Hit::source)
          .filter(Objects::nonNull)
          .map(BookDocument::toBook)
          .collect(java.util.stream.Collectors.toList());

    } catch (IOException e) {
      throw new RuntimeException("OpenSearch suggest falhou", e);
    }
  }

  @Recover
  public List<Book> suggestFallback(RuntimeException e, String query) {
    log.warn(
        "OpenSearch indisponível durante suggest após 2 tentativas. query='{}'. Causa: {}",
        query,
        e.getCause() != null ? e.getCause().getMessage() : e.getMessage());
    return List.of();
  }

  public void index(Book book) {
    try {
      var doc = BookDocument.fromBook(book);
      var request =
          IndexRequest.of(
              ir -> ir.index(INDEX_NAME).id(String.valueOf(book.getId())).document(doc));
      client.index(request);
    } catch (IOException e) {
      log.error(
          "Falha ao indexar livro no OpenSearch. isbn={}. O dado permanece no MySQL. Causa: {}",
          book.getIsbn(),
          e.getMessage());
    }
  }

  public void indexAll(List<Book> books) {
    if (books.isEmpty()) return;

    try {
      var operations =
          books.stream()
              .map(
                  book ->
                      BulkOperation.of(
                          op ->
                              op.index(
                                  IndexOperation.of(
                                      io ->
                                          io.index(INDEX_NAME)
                                              .id(String.valueOf(book.getId()))
                                              .document(BookDocument.fromBook(book))))))
              .toList();

      var response = client.bulk(b -> b.operations(operations));

      if (response.errors()) {
        log.warn(
            "Alguns livros não foram indexados durante o indexAll. Verifique os logs do OpenSearch.");
      }
    } catch (IOException e) {
      log.error(
          "Falha no indexAll. O índice será reconstruído no próximo startup. Causa: {}",
          e.getMessage());
    }
  }

  public long count() {
    try {
      var response = client.count(c -> c.index(INDEX_NAME));
      return response.count();
    } catch (Exception e) {
      log.warn(
          "Não foi possível contar documentos no OpenSearch. Assumindo 0. Causa: {}",
          e.getMessage());
      return 0L;
    }
  }

  @Async("bookEnrichExecutor")
  @EventListener(ApplicationReadyEvent.class)
  @Retryable(
      retryFor = Exception.class,
      maxAttempts = 5,
      backoff = @Backoff(delay = 5000, multiplier = 2))
  public void bootstrapIndex() {
    try {
      BooleanResponse exists = client.indices().exists(e -> e.index(INDEX_NAME));
      if (!exists.value()) {
        client.indices().create(c -> c.index(INDEX_NAME));
      }

      long indexed = count();
      long inDb = repository.count();
      if (indexed >= inDb) {
        return;
      }

      indexAll(repository.findAll());

    } catch (Exception e) {
      log.error(
          "Falha no bootstrap do OpenSearch. A aplicação continuará funcional sem busca local. Causa: {}",
          e.getMessage());
    }
  }

  record BookDocument(
      Long id,
      String isbn,
      String title,
      List<String> authors,
      String publisher,
      String description,
      String coverUrl,
      String searchText,
      Float averageRating,
      Integer pageCount) {
    static BookDocument fromBook(Book book) {
      return new BookDocument(
          book.getId(),
          book.getIsbn(),
          book.getTitle(),
          book.getAuthors(),
          book.getPublisher(),
          book.getDescription(),
          book.getCoverUrl(),
          book.getSearchText(),
          book.getAverageRating(),
          book.getPageCount());
    }

    Book toBook() {
      return Book.builder()
          .id(id)
          .isbn(isbn)
          .title(title)
          .authors(authors)
          .publisher(publisher)
          .description(description)
          .coverUrl(coverUrl)
          .searchText(searchText)
          .averageRating(averageRating)
          .pageCount(pageCount)
          .build();
    }
  }
}
