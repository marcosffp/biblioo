package com.biblioo.books.infrasestructure.dto.book;

import java.util.List;

public record BookResponse(
    Long id,
    String title,
    List<String> authors,
    String coverUrl,
    Integer pageCount,
    Float averageRating) {}
