package com.biblioo.books.infrasestructure.dto.shelfItem;

import com.biblioo.books.domain.model.ReadingStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

public record ChangeItemStatusRequest(
    @Schema(description = "Novo status de leitura do livro", example = "READING")
        @NotNull(message = "O novo status é obrigatório.")
        ReadingStatus newStatus) {}
