package com.biblioo.books.infrasestructure.dto.shelfItem;

import com.biblioo.books.domain.model.ReadingStatus;

public record ShelfItemSummaryResponse(
    Long id,
    Long bookId,
    String bookTitle,
    String bookCoverUrl,
    ReadingStatus status,
    Integer progressPercent) {}
