package com.biblioo.books.infrasestructure.config;

import com.biblioo.books.domain.model.Book;
import com.biblioo.books.infrasestructure.persistence.BookRepository;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
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
    String booleanQuery = buildBooleanModeQuery(query);
    if (booleanQuery.isEmpty()) return List.of();
    var books = repository.searchByTerm(booleanQuery);
    books.forEach(
        b -> {
          Hibernate.initialize(b.getAuthors());
          if (b.getAuthors() != null) {
            b.setAuthors(new ArrayList<>(b.getAuthors()));
          }
        });
    return books;
  }

  // Converte a query do usuário para MySQL BOOLEAN MODE:
  // remove operadores especiais, exige cada token (+) e permite prefixo (*)
  private String buildBooleanModeQuery(String term) {
    String sanitized = term.replaceAll("[+\\-><()~*\"@]", " ").trim();
    if (sanitized.isEmpty()) return "";
    return Arrays.stream(sanitized.split("\\s+"))
        .filter(t -> t.length() >= 2)
        .map(t -> "+" + t + "*")
        .collect(Collectors.joining(" "));
  }
}
