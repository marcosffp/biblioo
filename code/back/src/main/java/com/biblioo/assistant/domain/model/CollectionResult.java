package com.biblioo.assistant.domain.model;

import java.util.List;

public record CollectionResult(
    Long id, String name, String description, List<ShelfResult> shelves) {}
