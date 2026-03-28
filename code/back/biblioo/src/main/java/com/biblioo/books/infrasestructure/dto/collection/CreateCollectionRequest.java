package com.biblioo.books.infrasestructure.dto.collection;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.util.List;

public record CreateCollectionRequest(

        @NotBlank(message = "O nome da coleção é obrigatório.")
        @Size(max = 100, message = "O nome deve ter no máximo 100 caracteres.")
        @Pattern(
            regexp = "^[\\p{L}0-9\\s\\-_,.()]+$",
            message = "O nome contém caracteres inválidos."
        )
        String name,

        @Size(max = 500, message = "A descrição deve ter no máximo 500 caracteres.")
        @Pattern(
            regexp = "^[\\p{L}0-9\\s\\-_,.!?()\"']*$",
            message = "A descrição contém caracteres inválidos."
        )
        String description,

        @Valid
        List<
            @NotNull(message = "IDs da lista de estantes não podem ser nulos.")
            @Positive(message = "IDs da lista de estantes devem ser positivos.")
            Long
        > initialShelfIds

) {}