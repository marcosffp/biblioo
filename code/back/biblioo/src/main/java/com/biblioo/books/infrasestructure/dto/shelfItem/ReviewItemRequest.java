package com.biblioo.books.infrasestructure.dto.shelfItem;

import jakarta.validation.constraints.*;

public record ReviewItemRequest(

        @NotNull(message = "A avaliação é obrigatória.")
        @Min(value = 1, message = "A avaliação mínima é 1.")
        @Max(value = 5, message = "A avaliação máxima é 5.")
        Integer rating,

        @Size(max = 500, message = "O review deve ter no máximo 500 caracteres.")
        @Pattern(
            regexp = "^[\\p{L}0-9\\s\\-_,.!?()\"']*$",
            message = "O review contém caracteres inválidos."
        )
        String reviewText

) {}