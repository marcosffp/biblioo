package com.biblioo.assistant.domain.model;

import java.util.List;

public record BookResult(Long id, String title, List<String> authors, Float averageRating) {}
