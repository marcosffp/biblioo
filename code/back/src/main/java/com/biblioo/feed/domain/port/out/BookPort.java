package com.biblioo.feed.domain.port.out;

import com.biblioo.books.domain.model.Book;

public interface BookPort {
  Book getBookById(Long bookId);

  boolean existsById(Long bookId);
}
