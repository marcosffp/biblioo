package com.biblioo.community.infrastructure.dto;

import jakarta.validation.constraints.NotNull;

public record InviteUserRequest(@NotNull Long inviteeId) {}
