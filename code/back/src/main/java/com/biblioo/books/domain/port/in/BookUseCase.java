package com.biblioo.books.domain.port.in;

import com.biblioo.books.domain.model.Book;
import java.util.List;

public interface BookUseCase {
  List<Book> search(String query);

  List<Book> suggest(String query);

  Book getById(Long id);
}
