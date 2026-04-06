package com.biblioo.books.domain.service;

import com.biblioo.books.domain.model.Book;
import com.biblioo.books.domain.model.Category;
import com.biblioo.books.infrasestructure.external.GoogleBooksAdapter;
import com.biblioo.books.infrasestructure.persistence.BookRepository;
import com.biblioo.books.infrasestructure.persistence.CategoryRepository;
import com.biblioo.books.infrasestructure.search.OpenSearchBookAdapter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookEnrichService {

  private final BookRepository repository;
  private final CategoryRepository categoryRepository;
  private final OpenSearchBookAdapter search;
  private final GoogleBooksAdapter external;

  public List<Book> enrichSync(String query) {
    var externalBooks = external.search(query);
    if (externalBooks.isEmpty()) return List.of();
    persistNewBooks(externalBooks);
    return externalBooks;
  }

  @Async("bookEnrichExecutor")
  public CompletableFuture<Void> enrichAsync(String query) {
    try {
      var externalBooks = external.search(query);
      persistNewBooks(externalBooks);
    } catch (Exception e) {
      log.debug(
          "Enriquecimento assíncrono falhou para query='{}'. Causa: {}", query, e.getMessage());
    }
    return CompletableFuture.completedFuture(null);
  }

  @Transactional
  public void persistNewBooks(List<Book> books) {
    var newBooks = filterExisting(books);
    if (newBooks.isEmpty()) return;
    resolveCategories(newBooks);
    var saved = repository.saveAll(newBooks);
    search.indexAll(saved);
  }

  private void resolveCategories(List<Book> books) {
    List<String> allNames =
        books.stream()
            .filter(b -> b.getRawCategoryNames() != null)
            .flatMap(b -> b.getRawCategoryNames().stream())
            .filter(Objects::nonNull)
            .distinct()
            .toList();

    if (allNames.isEmpty()) return;

    Map<String, Category> existing =
        categoryRepository.findByNameIn(allNames).stream()
            .collect(Collectors.toMap(Category::getName, Function.identity()));

    List<Category> toCreate =
        allNames.stream()
            .filter(name -> !existing.containsKey(name))
            .map(name -> Category.builder().name(name).build())
            .toList();

    if (!toCreate.isEmpty()) {
      categoryRepository.saveAll(toCreate).forEach(c -> existing.put(c.getName(), c));
    }

    for (Book book : books) {
      if (book.getRawCategoryNames() == null || book.getRawCategoryNames().isEmpty()) continue;
      List<Category> resolved =
          book.getRawCategoryNames().stream()
              .map(existing::get)
              .filter(Objects::nonNull)
              .collect(Collectors.toCollection(ArrayList::new));
      book.setCategories(resolved);
    }
  }

  private List<Book> filterExisting(List<Book> books) {
    var isbns = books.stream().map(Book::getIsbn).filter(Objects::nonNull).toList();

    if (isbns.isEmpty()) return List.of();

    Set<String> existing = repository.findExistingIsbns(isbns);

    return books.stream()
        .filter(b -> b.getIsbn() != null)
        .filter(b -> !existing.contains(b.getIsbn()))
        .toList();
  }
}
