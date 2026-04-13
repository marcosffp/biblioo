package com.biblioo.books.infrasestructure.dto.shelf;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateShelfRequest(
    @Schema(description = "Novo nome da estante", example = "Já Lidos - 2026")
        @NotBlank(message = "O nome da estante é obrigatório.")
        @Size(max = 100, message = "O nome deve ter no máximo 100 caracteres.")
        @Pattern(
            regexp = "^[\\p{L}0-9\\s\\-_,.()]+$",
            message = "O nome contém caracteres inválidos.")
        String name,
    @Schema(
            description = "Nova descrição da estante",
            example = "Lista final dos livros lidos este ano.")
        @Size(max = 300, message = "A descrição deve ter no máximo 300 caracteres.")
        @Pattern(
            regexp = "^[\\p{L}0-9\\s\\-_,.!?()\"']*$",
            message = "A descrição contém caracteres inválidos.")
        String description) {}
