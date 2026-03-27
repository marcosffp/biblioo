package com.biblioo.books.infrasestructure.dto;

import java.util.List;

public record BookResponse(
    Long id,
    String isbn,
    String title,
    List<String> authors,
    String publisher,
    String publishedAt,
    String coverUrl,
    Integer pageCount,
    Float averageRating,
    String language) {}
