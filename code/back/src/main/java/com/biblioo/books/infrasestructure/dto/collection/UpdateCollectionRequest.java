package com.biblioo.books.infrasestructure.dto.collection;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateCollectionRequest(
    @Schema(description = "Novo nome da coleção", example = "Top 10 Lidos")
        @NotBlank(message = "O nome da coleção é obrigatório.")
        @Size(max = 100, message = "O nome deve ter no máximo 100 caracteres.")
        @Pattern(
            regexp = "^[\\p{L}0-9\\s\\-_,.()]+$",
            message = "O nome contém caracteres inválidos.")
        String name,
    @Schema(description = "Nova descrição da coleção", example = "Meus 10 livros favoritos do ano.")
        @Size(max = 500, message = "A descrição deve ter no máximo 500 caracteres.")
        @Pattern(
            regexp = "^[\\p{L}0-9\\s\\-_,.!?()\"']*$",
            message = "A descrição contém caracteres inválidos.")
        String description) {}
