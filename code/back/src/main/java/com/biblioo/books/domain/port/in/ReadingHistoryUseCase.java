package com.biblioo.books.domain.port.in;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface ReadingHistoryUseCase {

  record BookReadingRecord(
      Long bookId,
      String title,
      List<String> categories,
      Integer complexityScore,
      LocalDate startedAt,
      LocalDate finishedAt,
      String status,
      Integer pageCount,
      List<String> authors,
      Integer rereadCount,
      LocalDateTime updatedAt) {}

  List<BookReadingRecord> getReadingHistory(Long userId);
}
