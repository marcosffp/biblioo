package com.biblioo.community.infrastructure.dto.voting;

import jakarta.validation.constraints.NotNull;

public record VotingOptionRequest(@NotNull(message = "O ID do livro é obrigatório") Long bookId) {}
