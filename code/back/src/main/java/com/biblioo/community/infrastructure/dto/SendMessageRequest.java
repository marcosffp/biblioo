package com.biblioo.community.infrastructure.dto;

import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.Set;

public record SendMessageRequest(
    @Size(max = 4000) String content,
    Long parentMessageId,
    @Size(max = 10) Set<String> tags,
    @Size(max = 5) List<String> images,
    @Size(max = 2048) String gifUrl,
    boolean hasSpoiler,
    @Size(max = 36) String clientMessageId) {}
