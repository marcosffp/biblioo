package com.biblioo.books.domain.service;

import com.biblioo.books.domain.exception.BookNotFoundException;
import com.biblioo.books.domain.model.Book;
import com.biblioo.books.domain.port.in.BookUseCase;
import com.biblioo.books.infrasestructure.config.BookQueryHelper;
import com.biblioo.books.infrasestructure.dto.book.BookSearchResult;
import com.biblioo.books.infrasestructure.persistence.BookRepository;
import com.biblioo.books.infrasestructure.search.OpenSearchBookAdapter;
import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.redis.core.RedisTemplate;
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
  private final CacheManager cacheManager;

  @Qualifier("bookEnrichExecutor")
  private final Executor bookEnrichExecutor;

  @Qualifier("bookCacheTemplate")
  private final RedisTemplate<String, Object> bookCacheTemplate;

  private static final String BOOK_DETAIL_KEY_PREFIX = "biblioo:book-detail::";
  private static final Duration BOOK_DETAIL_TTL = Duration.ofHours(1);
  private static final int ENRICH_THRESHOLD = 5;
  private static final int MAX_RESULTS = 15;


  private final ConcurrentHashMap<String, CompletableFuture<List<BookSearchResult>>> inFlight =
      new ConcurrentHashMap<>();

  @Override
  public List<BookSearchResult> search(String query) {
    String key = query.strip().toLowerCase();
    Cache cache = cacheManager.getCache("book-search");

    if (cache != null) {
      Cache.ValueWrapper hit = null;
      try {
        hit = cache.get(key);
      } catch (Exception e) {
        log.warn(
            "Cache GET corrompido para book-search key='{}'. Evictando e tratando como miss. Causa: {}",
            key,
            e.getMessage());
        try {
          cache.evict(key);
        } catch (Exception evictEx) {
          log.warn("Falha ao evictar key='{}' do book-search. Causa: {}", key, evictEx.getMessage());
        }
      }
      if (hit != null) {
        try {
          @SuppressWarnings("unchecked")
          List<BookSearchResult> cached = (List<BookSearchResult>) hit.get();
          return cached != null ? cached : List.of();
        } catch (ClassCastException e) {
          cache.evict(key);
        }
      }
    }

    CompletableFuture<List<BookSearchResult>> myFuture = new CompletableFuture<>();
    CompletableFuture<List<BookSearchResult>> existing = inFlight.putIfAbsent(key, myFuture);

    if (existing != null) {
      try {
        return existing.join();
      } catch (Exception e) {
        log.warn("Search compartilhada falhou para query='{}'. Causa: {}", query, e.getMessage());
        return List.of();
      }
    }

    try {
      List<BookSearchResult> result = doSearch(key);
      myFuture.complete(result);
      if (result.size() >= ENRICH_THRESHOLD && cache != null) {
        cache.put(key, result);
      }
      return result;
    } catch (Exception e) {
      myFuture.completeExceptionally(e);
      log.warn("Search falhou para query='{}'. Causa: {}", query, e.getMessage());
      return List.of();
    } finally {
      inFlight.remove(key, myFuture);
    }
  }

  private List<BookSearchResult> doSearch(String query) {
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

    List<Book> local = new ArrayList<>(futureLocal.join());

    // Resultados locais suficientes — retorna sem enriquecer
    if (local.size() >= ENRICH_THRESHOLD) {
      return local.stream().map(this::toSearchResult).toList();
    }

    // Sem resultados no OpenSearch: tenta fallback no banco
    if (local.isEmpty()) {
      try {
        List<Book> db = bookQueryHelper.searchByTerm(query);
        if (!db.isEmpty()) local = new ArrayList<>(db);
      } catch (Exception e) {
        log.warn("DB falhou durante searchByTerm. query='{}'. Causa: {}", query, e.getMessage());
      }
      if (local.size() >= ENRICH_THRESHOLD) {
        return local.stream().map(this::toSearchResult).toList();
      }
    }

    // Poucos ou nenhum resultado local: enriquece do Google Books e mescla
    try {
      List<Book> external = enrichService.enrichSync(query);
      if (local.isEmpty()) {
        return external.stream().map(this::toSearchResult).toList();
      }
      var localIsbns =
          local.stream()
              .map(Book::getIsbn)
              .filter(java.util.Objects::nonNull)
              .collect(java.util.stream.Collectors.toSet());
      external.stream()
          .filter(b -> b.getIsbn() == null || !localIsbns.contains(b.getIsbn()))
          .forEach(local::add);
      return local.stream().limit(MAX_RESULTS).map(this::toSearchResult).toList();
    } catch (Exception e) {
      log.warn("Enriquecimento externo falhou. query='{}'. Causa: {}", query, e.getMessage());
      return local.stream().map(this::toSearchResult).toList();
    }
  }

  private BookSearchResult toSearchResult(Book book) {
    return BookSearchResult.builder()
        .id(book.getId())
        .title(book.getTitle())
        .authors(book.getAuthors() != null ? new ArrayList<>(book.getAuthors()) : new ArrayList<>())
        .coverUrl(book.getCoverUrl())
        .pageCount(book.getPageCount())
        .averageRating(book.getAverageRating())
        .description(book.getDescription())
        .readerCount(book.getReaderCount())
        .build();
  }

  @Override
  @Transactional(readOnly = true)
  @Cacheable(value = "book-detail", key = "#id")
  public Book getById(Long id) {
    return repository.findById(id).orElseThrow(() -> new BookNotFoundException(id));
  }

  @Override
  public List<Book> getByIds(List<Long> ids) {
    if (ids.isEmpty()) return List.of();

    List<String> keys = ids.stream().map(id -> BOOK_DETAIL_KEY_PREFIX + id).toList();
    List<Object> cached = bookCacheTemplate.opsForValue().multiGet(keys);

    Map<Long, Book> result = new LinkedHashMap<>();
    List<Long> missingIds = new ArrayList<>();

    for (int i = 0; i < ids.size(); i++) {
      Object val = cached != null ? cached.get(i) : null;
      if (val instanceof Book book) {
        result.put(ids.get(i), book);
      } else {
        missingIds.add(ids.get(i));
      }
    }

    if (!missingIds.isEmpty()) {
      List<Book> fromDb = repository.findAllById(missingIds);
      for (Book book : fromDb) {
        bookCacheTemplate.opsForValue().set(BOOK_DETAIL_KEY_PREFIX + book.getId(), book, BOOK_DETAIL_TTL);
        result.put(book.getId(), book);
      }
    }

    return ids.stream().map(result::get).filter(java.util.Objects::nonNull).toList();
  }
}
