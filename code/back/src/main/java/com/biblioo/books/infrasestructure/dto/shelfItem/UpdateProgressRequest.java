package com.biblioo.books.infrasestructure.dto.shelfItem;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record UpdateProgressRequest(
    @Schema(description = "Página atual em que o usuário se encontra", example = "42")
        @NotNull(message = "A página atual é obrigatória.")
        @Min(value = 0, message = "A página atual não pode ser negativa.")
        @Max(value = 10000, message = "A página atual é muito alta.")
        Integer currentPage) {}
