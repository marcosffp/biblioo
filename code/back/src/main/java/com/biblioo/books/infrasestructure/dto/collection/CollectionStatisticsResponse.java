package com.biblioo.books.infrasestructure.dto.collection;

public record CollectionStatisticsResponse(
    Long collectionId,
    int totalBooks,
    int booksCompleted,
    int booksReading,
    int booksRereading,
    int booksWantToRead,
    int booksAbandoned,
    int totalPages,
    int pagesRead) {}
