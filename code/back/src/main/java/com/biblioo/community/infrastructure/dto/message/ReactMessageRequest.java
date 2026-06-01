package com.biblioo.community.infrastructure.dto.message;

import com.biblioo.community.domain.model.enumeration.ReactionType;

import jakarta.validation.constraints.NotNull;

public record ReactMessageRequest(@NotNull ReactionType reactionType) {}
