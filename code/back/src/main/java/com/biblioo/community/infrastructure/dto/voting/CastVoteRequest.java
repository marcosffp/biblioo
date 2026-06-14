package com.biblioo.community.infrastructure.dto.voting;

import jakarta.validation.constraints.NotNull;

public record CastVoteRequest(@NotNull(message = "O ID da opção é obrigatório") Long optionId) {}
