package com.biblioo.community.infrastructure.dto;

import com.biblioo.community.domain.model.TieBreakRule;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import java.util.List;

public record CreateVotingRequest(
    @NotBlank(message = "O título da votação é obrigatório") @Size(max = 200) String title,
    @NotNull(message = "A regra de desempate é obrigatória") TieBreakRule tieBreakRule,
    @NotNull(message = "A data de início é obrigatória") LocalDateTime startsAt,
    @NotNull(message = "A data de encerramento é obrigatória") LocalDateTime endsAt,
    @NotNull
        @Size(min = 3, max = 6, message = "A votação deve ter entre 3 e 6 opções de livros")
        @Valid
        List<VotingOptionRequest> options) {}
