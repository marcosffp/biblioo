package com.biblioo.books.infrasestructure.external;

import com.biblioo.books.domain.model.Book;
import com.biblioo.books.domain.port.in.BookUseCase;
import com.biblioo.books.infrasestructure.persistence.BookRepository;
import com.biblioo.books.infrasestructure.persistence.ShelfItemRepository;
import com.biblioo.community.domain.port.out.CommunityBookLookupPort;
import com.biblioo.community.infrastructure.dto.community.CommunityBookSummary;
import com.biblioo.feed.domain.port.out.BookPort;
import com.biblioo.feed.domain.port.out.ShelfInteractionPort;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;


@Component
@RequiredArgsConstructor
public class FeedInteractionAdapter
    implements BookPort, ShelfInteractionPort, CommunityBookLookupPort {

  private final BookUseCase bookUseCase;
  private final BookRepository bookRepository;
  private final ShelfItemRepository shelfItemRepository;

  @Override
  public Book getBookById(Long bookId) {
    return bookUseCase.getById(bookId);
  }

  @Override
  public boolean existsById(Long bookId) {
    return bookRepository.existsById(bookId);
  }

  @Override
  public CommunityBookSummary getById(Long bookId) {
    return bookRepository
        .findById(bookId)
        .map(book -> new CommunityBookSummary(book.getId(), book.getTitle(), book.getCoverUrl()))
        .orElse(null);
  }

  @Override
  public List<Book> getBooksByIds(List<Long> bookIds) {
    return bookRepository.findAllById(bookIds);
  }

  @Override
  public boolean containsBook(Long userId, Long bookId) {
    return shelfItemRepository.existsActiveByUserIdAndBookId(userId, bookId);
  }
}
