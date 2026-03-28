package com.biblioo.books.infrasestructure.dto.shelfItem;

import com.biblioo.books.domain.model.ReadingStatus;
import jakarta.validation.constraints.NotNull;

public record ChangeItemStatusRequest(

        @NotNull(message = "O novo status é obrigatório.")
        ReadingStatus newStatus

) {}