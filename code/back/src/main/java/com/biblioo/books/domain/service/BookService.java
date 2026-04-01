package com.biblioo.books.domain.service;

import com.biblioo.books.domain.exception.BookNotFoundException;
import com.biblioo.books.domain.model.Book;
import com.biblioo.books.domain.port.in.BookUseCase;
import com.biblioo.books.infrasestructure.persistence.BookRepository;
import com.biblioo.books.infrasestructure.search.OpenSearchBookAdapter;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class BookService implements BookUseCase {

  private final BookRepository repository;
  private final OpenSearchBookAdapter search;
  private final BookEnrichService enrichService;

  @Override
  @Cacheable(
      value = "book-search",
      key = "#query.strip().toLowerCase()",
      unless = "#result.isEmpty()")
  public List<Book> search(String query) {
    var local = search.search(query);

    if (local.isEmpty()) {
      var db = repository.searchByTerm(query);
      if (!db.isEmpty()) {
        if (db.size() < 3) {
          enrichService.enrichAsync(query);
        }
        return db;
      }
      return enrichService.enrichSync(query);
    }

    if (local.size() < 3) {
      enrichService.enrichAsync(query);
    }

    return local;
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
          .toList();
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
