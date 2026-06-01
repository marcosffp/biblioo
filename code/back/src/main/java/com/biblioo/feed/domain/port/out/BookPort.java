package com.biblioo.feed.domain.port.out;

import com.biblioo.books.domain.model.Book;
import java.util.List;

public interface BookPort {
  Book getBookById(Long bookId);

  boolean existsById(Long bookId);

  List<Book> getBooksByIds(List<Long> bookIds);
}
