package com.biblioo.books.infrasestructure.dto.shelf;

import java.util.List;

public record ShelfSummaryResponse(
    Long id, String name, String description, int itemCount, List<String> coverPreview) {}
