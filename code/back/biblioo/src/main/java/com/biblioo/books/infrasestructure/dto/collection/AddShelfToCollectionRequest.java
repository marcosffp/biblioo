package com.biblioo.books.infrasestructure.dto.collection;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record AddShelfToCollectionRequest(
    @Schema(description = "ID da estante a ser adicionada na coleção", example = "42")
        @NotNull(message = "O ID da estante é obrigatório.")
        @Positive(message = "O ID da estante deve ser positivo.")
        Long shelfId) {}
