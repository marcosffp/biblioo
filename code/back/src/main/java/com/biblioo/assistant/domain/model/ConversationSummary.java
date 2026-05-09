package com.biblioo.assistant.domain.model;

import java.time.LocalDateTime;

public record ConversationSummary(
    String id, String title, LocalDateTime createdAt, LocalDateTime updatedAt) {}
