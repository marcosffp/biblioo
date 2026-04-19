package com.biblioo.community.infrastructure.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record EditMessageRequest(@NotBlank @Size(min = 1, max = 4000) String content) {}
