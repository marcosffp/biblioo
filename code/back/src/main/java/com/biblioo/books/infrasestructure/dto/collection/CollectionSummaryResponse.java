package com.biblioo.books.infrasestructure.dto.collection;

import java.util.List;

public record CollectionSummaryResponse(
    Long id, String name, String description, int shelfCount, List<ShelfPreview> shelfPreviews) {}
