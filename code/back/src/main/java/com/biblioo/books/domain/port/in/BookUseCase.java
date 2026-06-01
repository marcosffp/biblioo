package com.biblioo.books.domain.port.in;

import com.biblioo.books.domain.model.Book;
import com.biblioo.books.infrasestructure.dto.book.BookSearchResult;

import java.util.List;

public interface BookUseCase {
  List<BookSearchResult> search(String query);

  Book getById(Long id);

  List<Book> getByIds(List<Long> ids);
}
