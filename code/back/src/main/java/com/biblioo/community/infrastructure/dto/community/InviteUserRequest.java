package com.biblioo.community.infrastructure.dto.community;

import jakarta.validation.constraints.NotNull;

public record InviteUserRequest(@NotNull Long inviteeId) {}
