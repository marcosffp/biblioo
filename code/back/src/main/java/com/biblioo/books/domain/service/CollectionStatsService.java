package com.biblioo.books.domain.service;

import com.biblioo.books.domain.model.Book;
import com.biblioo.books.domain.model.Collection;
import com.biblioo.books.domain.model.ReadingStatus;
import com.biblioo.books.domain.model.Shelf;
import com.biblioo.books.domain.model.ShelfItem;
import com.biblioo.books.domain.port.in.CollectionStatsUseCase;
import com.biblioo.books.domain.port.in.CollectionUseCase;
import com.biblioo.books.domain.port.in.ShelfUseCase;
import com.biblioo.books.infrasestructure.dto.collection.CollectionStatisticsResponse;
import com.biblioo.books.infrasestructure.dto.collection.CollectionStatsResponse;
import com.biblioo.books.infrasestructure.dto.collection.CollectionStatsResponse.GenreStats;
import com.biblioo.books.infrasestructure.dto.collection.CollectionStatsResponse.ProgressStats;
import com.biblioo.books.infrasestructure.persistence.BookRepository;
import com.biblioo.books.infrasestructure.persistence.ShelfItemRepository;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CollectionStatsService implements CollectionStatsUseCase {

  private static final int TOP_GENRES = 3;

  private final ShelfItemRepository shelfItemRepository;
  private final BookRepository bookRepository;
  private final ShelfUseCase shelfUseCase;
  private final CollectionUseCase collectionUseCase;

  @Override
  @Transactional(readOnly = true)
  public CollectionStatsResponse computeStats(Collection collection) {
    List<Shelf> shelves = collection.getShelves();
    if (shelves == null || shelves.isEmpty()) {
      return emptyStats();
    }

    List<Long> shelfIds = shelves.stream().map(Shelf::getId).toList();
    List<ShelfItem> allItems = shelfItemRepository.findAllByShelfIdIn(shelfIds);

    Map<Long, ShelfItem> byBookId = new HashMap<>();
    for (ShelfItem item : allItems) {
      byBookId.merge(item.getBookId(), item, CollectionStatsService::mostAdvanced);
    }

    List<ShelfItem> items = new ArrayList<>(byBookId.values());
    List<Long> bookIds = items.stream().map(ShelfItem::getBookId).toList();
    List<Book> books = bookIds.isEmpty() ? List.of() : bookRepository.findAllById(bookIds);

    return new CollectionStatsResponse(
        computeProgress(items), computeTopGenres(books), computeAverageRating(books));
  }

  @Override
  @Transactional(readOnly = true)
  public CollectionStatisticsResponse computeStatistics(Long userId, Long collectionId) {
    Collection col = collectionUseCase.getCollection(userId, collectionId);

    int totalBooks = 0, booksCompleted = 0, booksReading = 0;
    int booksRereading = 0, booksWantToRead = 0, booksAbandoned = 0;
    int totalPages = 0, pagesRead = 0;

    for (Shelf shelf : col.getShelves()) {
      List<ShelfItem> items = loadItemsSafely(userId, shelf.getId());
      for (ShelfItem item : items) {
        totalBooks++;
        switch (item.getStatus()) {
          case COMPLETED -> booksCompleted++;
          case READING -> booksReading++;
          case REREADING -> booksRereading++;
          case WANT_TO_READ -> booksWantToRead++;
          case ABANDONED -> booksAbandoned++;
        }
        if (item.getTotalPages() != null) totalPages += item.getTotalPages();
        if (item.getCurrentPage() != null) pagesRead += item.getCurrentPage();
      }
    }

    return new CollectionStatisticsResponse(
        collectionId,
        totalBooks,
        booksCompleted,
        booksReading,
        booksRereading,
        booksWantToRead,
        booksAbandoned,
        totalPages,
        pagesRead);
  }

  private List<ShelfItem> loadItemsSafely(Long userId, Long shelfId) {
    try {
      return shelfUseCase.listShelfItems(userId, shelfId);
    } catch (Exception e) {
      return List.of();
    }
  }

  private ProgressStats computeProgress(List<ShelfItem> items) {
    long completed = count(items, ReadingStatus.COMPLETED);
    long reading = count(items, ReadingStatus.READING) + count(items, ReadingStatus.REREADING);
    long abandoned = count(items, ReadingStatus.ABANDONED);
    long active = completed + reading + abandoned;

    if (active == 0) {
      return new ProgressStats(0, 0, 0, 0, 0, 0);
    }

    return new ProgressStats(
        (int) completed,
        (int) reading,
        (int) abandoned,
        percent(completed, active),
        percent(reading, active),
        percent(abandoned, active));
  }

  private List<GenreStats> computeTopGenres(List<Book> books) {
    Map<String, Long> counts = new HashMap<>();
    for (Book book : books) {
      if (book.getCategories() == null) continue;
      book.getCategories()
          .forEach(
              cat -> {
                if (cat != null && cat.getName() != null && !cat.getName().isBlank()) {
                  counts.merge(cat.getName(), 1L, Long::sum);
                }
              });
    }

    long total = counts.values().stream().mapToLong(Long::longValue).sum();
    if (total == 0) return List.of();

    return counts.entrySet().stream()
        .sorted(Map.Entry.<String, Long>comparingByValue(Comparator.reverseOrder()))
        .limit(TOP_GENRES)
        .map(e -> new GenreStats(e.getKey(), e.getValue().intValue(), percent(e.getValue(), total)))
        .toList();
  }

  private Double computeAverageRating(List<Book> books) {
    java.util.OptionalDouble avg =
        books.stream()
            .filter(b -> b.getAverageRating() != null && b.getAverageRating() > 0)
            .mapToDouble(Book::getAverageRating)
            .average();
    if (avg.isEmpty()) return null;
    return Math.round(avg.getAsDouble() * 10.0) / 10.0;
  }

  private static long count(List<ShelfItem> items, ReadingStatus status) {
    return items.stream().filter(i -> i.getStatus() == status).count();
  }

  private static int percent(long part, long total) {
    return (int) Math.round(100.0 * part / total);
  }

  private static ShelfItem mostAdvanced(ShelfItem a, ShelfItem b) {
    return statusPriority(a.getStatus()) >= statusPriority(b.getStatus()) ? a : b;
  }

  private static int statusPriority(ReadingStatus status) {
    return switch (status) {
      case COMPLETED -> 4;
      case READING -> 3;
      case REREADING -> 2;
      case ABANDONED -> 1;
      case WANT_TO_READ -> 0;
    };
  }

  private CollectionStatsResponse emptyStats() {
    return new CollectionStatsResponse(new ProgressStats(0, 0, 0, 0, 0, 0), List.of(), null);
  }
}
