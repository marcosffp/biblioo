package com.biblioo.books.domain.service;

import com.biblioo.books.domain.model.Book;
import com.biblioo.books.domain.model.Category;
import com.biblioo.books.domain.model.ReadingStatus;
import com.biblioo.books.domain.port.in.ReadingHistoryUseCase;
import com.biblioo.books.infrasestructure.persistence.BookRepository;
import com.biblioo.books.infrasestructure.persistence.ShelfItemRepository;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReadingHistoryService implements ReadingHistoryUseCase {

  private static final List<ReadingStatus> DNA_RELEVANT_STATUSES =
      List.of(ReadingStatus.COMPLETED, ReadingStatus.ABANDONED);

  private final ShelfItemRepository shelfItemRepository;
  private final BookRepository bookRepository;

  @Override
  @Transactional(readOnly = true)
  public List<BookReadingRecord> getReadingHistory(Long userId) {
    var items = shelfItemRepository.findByUserIdAndStatusIn(userId, DNA_RELEVANT_STATUSES);
    if (items.isEmpty()) return List.of();

    Set<Long> bookIds = items.stream().map(i -> i.getBookId()).collect(Collectors.toSet());
    Map<Long, Book> bookById =
        bookRepository.findAllById(bookIds).stream().collect(Collectors.toMap(Book::getId, b -> b));

    return items.stream()
        .filter(i -> bookById.containsKey(i.getBookId()))
        .map(
            item -> {
              Book book = bookById.get(item.getBookId());
              return new BookReadingRecord(
                  book.getId(),
                  book.getTitle(),
                  book.getCategories() != null
                      ? book.getCategories().stream().map(Category::getName).toList()
                      : List.of(),
                  book.getComplexityScore(),
                  item.getStartedAt(),
                  item.getFinishedAt(),
                  item.getStatus().name(),
                  book.getPageCount(),
                  book.getAuthors() != null ? List.copyOf(book.getAuthors()) : List.of(),
                  item.getRereadCount() != null ? item.getRereadCount() : 0,
                  item.getUpdatedAt());
            })
        .toList();
  }

  @Override
  @Transactional(readOnly = true)
  public int getCurrentReadingPagesTotal(Long userId) {
    return shelfItemRepository
        .findByUserIdAndStatusIn(userId, List.of(ReadingStatus.READING, ReadingStatus.REREADING))
        .stream()
        .mapToInt(item -> item.getCurrentPage() != null ? item.getCurrentPage() : 0)
        .sum();
  }
}
