package com.biblioo.books.infrasestructure.dto.shelfItem;

import com.biblioo.books.domain.model.ReadingStatus;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record AddShelfItemRequest(

        @NotNull(message = "O ID do livro é obrigatório.")
        @Positive(message = "O ID do livro deve ser positivo.")
        Long bookId,

        ReadingStatus initialStatus

) {}