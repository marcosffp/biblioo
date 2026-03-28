package com.biblioo.books.infrasestructure.dto.book;

import java.util.List;

public record BookSuggestResponse(Long id, String title, List<String> authors, String coverUrl) {}
