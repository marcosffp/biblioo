package com.biblioo.assistant.infrastructure.web.dto;

import jakarta.validation.constraints.NotBlank;

public record ChatRequest(
    @NotBlank(message = "A mensagem não pode ser vazia.") String message, String conversationId) {}
