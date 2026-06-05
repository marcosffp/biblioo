package com.biblioo.share.domain.model;

import java.time.LocalDate;
import java.util.List;

public record GoodreadsImportRow(
    long goodreadsBookId,
    String title,
    String author,
    String authorLf,
    List<String> additionalAuthors,
    String isbn,
    String isbn13,
    int myRating,
    String publisher,
    String binding,
    Integer numberOfPages,
    Integer yearPublished,
    Integer originalPublicationYear,
    LocalDate dateRead,
    LocalDate dateAdded,
    List<String> bookshelves,
    String exclusiveShelf,
    String myReview,
    boolean spoiler,
    String privateNotes,
    int readCount,
    int ownedCopies) {}
