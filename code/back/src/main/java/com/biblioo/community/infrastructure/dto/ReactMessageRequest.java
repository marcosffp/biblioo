package com.biblioo.community.infrastructure.dto;

import com.biblioo.community.domain.model.ReactionType;
import jakarta.validation.constraints.NotNull;

public record ReactMessageRequest(@NotNull ReactionType reactionType) {}
