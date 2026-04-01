package com.biblioo.books.infrasestructure.dto.shelfItem;

import com.biblioo.books.domain.model.ReadingStatus;
import java.util.List;

public record ShelfItemResponse(
    Long id,
    Long shelfId,
    Long bookId,
    String bookTitle,
    String bookCoverUrl,
    ReadingStatus status,
    Integer currentPage,
    Integer totalPages,
    Integer progressPercent,
    Integer rating,
    String reviewText,
    List<String> reviewImageUrls) {}
