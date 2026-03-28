package com.biblioo.books.infrasestructure.dto.shelfItem;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record UpdateProgressRequest(

        @NotNull(message = "A página atual é obrigatória.")
        @Min(value = 0, message = "A página atual não pode ser negativa.")
        @Max(value = 10000, message = "A página atual é muito alta.")
        Integer currentPage

) {}