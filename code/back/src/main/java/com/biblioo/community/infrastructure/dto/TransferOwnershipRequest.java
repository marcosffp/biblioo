package com.biblioo.community.infrastructure.dto;

import jakarta.validation.constraints.NotNull;

public record TransferOwnershipRequest(@NotNull Long newOwnerId) {}
