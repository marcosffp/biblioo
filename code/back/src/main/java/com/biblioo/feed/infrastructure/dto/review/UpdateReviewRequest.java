package com.biblioo.feed.infrastructure.dto.review;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

public record UpdateReviewRequest(
    @NotBlank(message = "O texto da avaliação é obrigatório")
        @Size(max = 2000, message = "O texto da avaliação não deve exceder 2000 caracteres")
        String text,
    @Min(value = 1, message = "A avaliação deve ser de no mínimo 1")
        @Max(value = 5, message = "A avaliação deve ser de no máximo 5")
        Integer rating,
    List<String> imagesToDeleteUrls,
    List<String> tags,
    Boolean hasSpoiler) {}
