package com.biblioo.books.infrasestructure.dto.shelfItem;

import com.biblioo.books.domain.model.ReadingStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record AddShelfItemRequest(
    @Schema(description = "ID do livro a ser adicionado", example = "10")
        @NotNull(message = "O ID do livro é obrigatório.")
        @Positive(message = "O ID do livro deve ser positivo.")
        Long bookId,
    @Schema(description = "Status inicial de leitura", example = "READING")
        ReadingStatus initialStatus) {}
