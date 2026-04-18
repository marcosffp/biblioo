package com.biblioo.books.domain.service;

import com.biblioo.books.domain.exception.BookNotFoundException;
import com.biblioo.books.domain.model.Book;
import com.biblioo.books.domain.port.in.BookUseCase;
import com.biblioo.books.infrasestructure.config.BookQueryHelper;
import com.biblioo.books.infrasestructure.persistence.BookRepository;
import com.biblioo.books.infrasestructure.search.OpenSearchBookAdapter;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
  private final BookQueryHelper bookQueryHelper;

  @Qualifier("bookEnrichExecutor")
  private final Executor bookEnrichExecutor;

  @Override
  // sync=true: com 50 VUs simultâneos na mesma query, apenas 1 executa o método;
  // os demais bloqueiam aguardando o cache ser populado. Elimina o thundering herd
  // que causava 50 chamadas paralelas ao Google Books e duplicate key no MySQL.
  @Cacheable(
      value = "book-search",
      key = "#query.strip().toLowerCase()",
      sync = true,
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
                  return new ArrayList<>();
                });

    var futureDb =
        CompletableFuture.supplyAsync(() -> bookQueryHelper.searchByTerm(query), bookEnrichExecutor)
            .exceptionally(
                e -> {
                  log.warn(
                      "DB falhou durante searchByTerm. query='{}'. Causa: {}",
                      query,
                      e.getMessage());
                  return new ArrayList<>();
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

    // Enriquecimento externo apenas quando fontes locais não têm resultado.
    // Antes era especulativo (sempre rodava), causando chamadas desnecessárias
    // ao Google Books e race conditions no insert mesmo quando OS/DB tinham dados.
    try {
      return enrichService.enrichSync(query);
    } catch (Exception e) {
      log.warn("Enriquecimento externo falhou. query='{}'. Causa: {}", query, e.getMessage());
      return new ArrayList<>();
    }
  }

  @Override
  @Transactional(readOnly = true)
  @Cacheable(value = "book-detail", key = "#id", sync = true)
  public Book getById(Long id) {
    return repository.findById(id).orElseThrow(() -> new BookNotFoundException(id));
  }
}
