package com.biblioo.books.infrasestructure.dto.collection;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.util.List;

public record CreateCollectionRequest(
    @Schema(description = "Nome da coleção", example = "Meus Favoritos")
        @NotBlank(message = "O nome da coleção é obrigatório.")
        @Size(max = 100, message = "O nome deve ter no máximo 100 caracteres.")
        @Pattern(
            regexp = "^[\\p{L}0-9\\s\\-_,.()]+$",
            message = "O nome contém caracteres inválidos.")
        String name,
    @Schema(
            description = "Descrição detalhada da coleção",
            example = "Estantes contendo meus livros favoritos de todos os tempos.")
        @Size(max = 500, message = "A descrição deve ter no máximo 500 caracteres.")
        @Pattern(
            regexp = "^[\\p{L}0-9\\s\\-_,.!?()\"']*$",
            message = "A descrição contém caracteres inválidos.")
        String description,
    @Schema(
            description = "Lista inicial de IDs das estantes a serem vinculadas",
            example = "[1, 2, 3]")
        @Valid
        List<
                @NotNull(message = "IDs da lista de estantes não podem ser nulos.")
                @Positive(message = "IDs da lista de estantes devem ser positivos.") Long>
            initialShelfIds) {}
