package com.biblioo.books.infrasestructure.dto.collection;


public record ShelfPreview(
        Long id,
        String name,
        int itemCount,
        String firstBookCoverUrl    
) {}