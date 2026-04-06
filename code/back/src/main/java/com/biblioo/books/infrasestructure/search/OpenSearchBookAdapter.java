package com.biblioo.books.infrasestructure.search;

import com.biblioo.books.domain.model.Book;
import com.biblioo.books.infrasestructure.persistence.BookRepository;
import java.io.IOException;
import java.util.List;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.opensearch.client.opensearch.OpenSearchClient;
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
      maxAttempts = 3,
      backoff = @Backoff(delay = 200, multiplier = 2),
      recover = "searchFallback")
  public List<Book> search(String query) {
    try {
      var multiMatch =
          MultiMatchQuery.of(
              mm ->
                  mm.query(query)
                      .fields("title^10", "authors^2", "isbn^5", "searchText^1")
                      .fuzziness("AUTO")
                      .operator(org.opensearch.client.opensearch._types.query_dsl.Operator.And)
                      .type(TextQueryType.BestFields));

      var request =
          SearchRequest.of(
              sr ->
                  sr.index(INDEX_NAME)
                      .query(q -> q.multiMatch(multiMatch))
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
        "OpenSearch indisponível durante search após 3 tentativas. query='{}'. Causa: {}",
        query,
        e.getCause() != null ? e.getCause().getMessage() : e.getMessage());
    return List.of();
  }

  @Retryable(
      retryFor = RuntimeException.class,
      maxAttempts = 3,
      backoff = @Backoff(delay = 200, multiplier = 2),
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
        "OpenSearch indisponível durante suggest após 3 tentativas. query='{}'. Causa: {}",
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
      log.debug("Livro indexado no OpenSearch. isbn={}", book.getIsbn());
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
      } else {
        log.info("indexAll concluído. {} livros indexados.", books.size());
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

  @Async
  @EventListener(ApplicationReadyEvent.class)
  public void bootstrapIndex() {
    try {
      BooleanResponse exists = client.indices().exists(e -> e.index(INDEX_NAME));
      if (!exists.value()) {
        log.info("Índice {} não encontrado. Criando índice...", INDEX_NAME);
        client.indices().create(c -> c.index(INDEX_NAME));
      }

      long indexed = count();
      if (indexed > 0) {
        log.info("OpenSearch já contêm {} livros. Bootstrap ignorado.", indexed);
        return;
      }

      log.info("Índice OpenSearch vazio. Iniciando bootstrap a partir do banco de dados...");
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
