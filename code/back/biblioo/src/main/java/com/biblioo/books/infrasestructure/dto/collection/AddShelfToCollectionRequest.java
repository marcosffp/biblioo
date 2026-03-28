package com.biblioo.books.infrasestructure.dto.collection;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record AddShelfToCollectionRequest(

        @NotNull(message = "O ID da estante é obrigatório.")
        @Positive(message = "O ID da estante deve ser positivo.")
        Long shelfId

) {}