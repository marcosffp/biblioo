package com.biblioo.books.infrasestructure.dto.collection;

import java.util.List;

public record CollectionResponse(
        Long id,
        String name,
        String description,
        int shelfCount,
        List<ShelfPreview> shelfPreviews
) {}