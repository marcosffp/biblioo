package com.biblioo.books.infrasestructure.config;

import com.biblioo.books.domain.model.Book;
import com.biblioo.books.infrasestructure.persistence.BookRepository;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class BookQueryHelper {

  private final BookRepository repository;

  @Transactional(readOnly = true)
  public List<Book> searchByTerm(String query) {
    var books = repository.searchByTerm(query);
    books.forEach(
        b -> {
          Hibernate.initialize(b.getAuthors());
          if (b.getAuthors() != null) {
            b.setAuthors(new ArrayList<>(b.getAuthors()));
          }
        });
    return books;
  }
}
