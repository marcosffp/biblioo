package com.biblioo.books.infrasestructure.dto.shelf;

import java.util.List;


public record ShelfResponse(
        Long id,
        String name,
        String description,
        int itemCount,
        List<String> coverPreview
) {}