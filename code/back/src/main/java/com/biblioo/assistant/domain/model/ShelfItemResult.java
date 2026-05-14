package com.biblioo.assistant.domain.model;

public record ShelfItemResult(
    Long itemId,
    Long bookId,
    String title,
    String status,
    Integer currentPage,
    Integer totalPages) {}
