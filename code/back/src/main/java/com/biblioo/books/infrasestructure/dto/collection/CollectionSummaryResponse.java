package com.biblioo.books.infrasestructure.dto.collection;

import java.util.List;

public record CollectionSummaryResponse(
    Long id, String name, int shelfCount, List<ShelfPreview> shelfPreviews) {}
