package com.biblioo.user.infrastructure.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record GoogleAuthRequest(@NotBlank @Size(max = 2000) String idToken) {}
