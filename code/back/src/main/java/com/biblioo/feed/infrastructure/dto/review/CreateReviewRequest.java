package com.biblioo.feed.infrastructure.dto.review;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateReviewRequest(
    @NotNull(message = "O ID do livro é obrigatório") Long bookId,
    @NotNull(message = "A avaliação é obrigatória")
        @Min(value = 1, message = "A avaliação deve ser de no mínimo 1")
        @Max(value = 5, message = "A avaliação deve ser de no máximo 5")
        Integer rating,
    @Size(max = 2000, message = "O texto da avaliação não deve exceder 2000 caracteres")
        String text) {}
