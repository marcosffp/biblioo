package com.biblioo.assistant.infrastructure.web.dto;

import java.time.LocalDateTime;

public record ConversationSummaryResponse(
    String id, String title, LocalDateTime createdAt, LocalDateTime updatedAt) {}
