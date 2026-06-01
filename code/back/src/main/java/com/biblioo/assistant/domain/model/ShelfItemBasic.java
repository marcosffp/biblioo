package com.biblioo.assistant.domain.model;

public record ShelfItemBasic(
    Long itemId,
    Long bookId,
    String status,
    Integer currentPage,
    Integer totalPages) {}
