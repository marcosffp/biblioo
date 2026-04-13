package com.biblioo.books.domain.service;

import com.biblioo.books.domain.exception.BookNotFoundException;
import com.biblioo.books.domain.model.Book;
import com.biblioo.books.domain.port.in.BookUseCase;
import com.biblioo.books.infrasestructure.persistence.BookRepository;
import com.biblioo.books.infrasestructure.search.OpenSearchBookAdapter;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@RequiredArgsConstructor
@Service
public class BookService implements BookUseCase {

  private final BookRepository repository;
  private final OpenSearchBookAdapter search;
  private final BookEnrichService enrichService;
  @Qualifier("bookEnrichExecutor")
  private final Executor bookEnrichExecutor;

  @Override
  @Cacheable(
      value = "book-search",
      key = "#query.strip().toLowerCase()",
      unless = "#result.isEmpty()")
  public List<Book> search(String query) {
    var futureLocal =
        CompletableFuture.supplyAsync(() -> search.search(query), bookEnrichExecutor)
            .exceptionally(
                e -> {
                  log.warn(
                      "OpenSearch falhou durante search. query='{}'. Causa: {}",
                      query,
                      e.getMessage());
                  return List.of();
                });

    var futureDb =
        CompletableFuture.supplyAsync(() -> repository.searchByTerm(query), bookEnrichExecutor)
            .exceptionally(
                e -> {
                  log.warn(
                      "DB falhou durante searchByTerm. query='{}'. Causa: {}",
                      query,
                      e.getMessage());
                  return List.of();
                });

    // Inicia especulativamente em paralelo com OS+DB.
    // Se local/DB tiverem resultado, roda em background como enriquecimento.
    // Se ambos estiverem vazios, o resultado já está pronto (ou quase) quando chegamos aqui.
    var futureExternal =
        CompletableFuture.supplyAsync(() -> enrichService.enrichSync(query), bookEnrichExecutor)
            .exceptionally(
                e -> {
                  log.warn(
                      "Enriquecimento externo falhou. query='{}'. Causa: {}", query, e.getMessage());
                  return List.of();
                });

    CompletableFuture.allOf(futureLocal, futureDb).join();

    var local = futureLocal.getNow(List.of());
    var db = futureDb.getNow(List.of());

    if (!local.isEmpty()) {
      return local;
    }

    if (!db.isEmpty()) {
      return db;
    }

    return futureExternal.join();
  }

  @Override
  @Cacheable(
      value = "book-suggest",
      key = "#query.strip().toLowerCase()",
      unless = "#result.isEmpty()")
  public List<Book> suggest(String query) {
    var results = search.suggest(query);
    if (results.isEmpty()) {
      return repository.findByTitleContainingIgnoreCaseOrderByTitleAsc(query).stream()
          .limit(8)
          .collect(java.util.stream.Collectors.toList());
    }
    return results;
  }

  @Override
  @Transactional(readOnly = true)
  @Cacheable(value = "book-detail", key = "#id")
  public Book getById(Long id) {
    return repository.findById(id).orElseThrow(() -> new BookNotFoundException(id));
  }
}
