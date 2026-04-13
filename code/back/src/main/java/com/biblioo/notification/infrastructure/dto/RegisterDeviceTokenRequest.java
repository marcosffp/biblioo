package com.biblioo.notification.infrastructure.dto;

import jakarta.validation.constraints.NotBlank;

public record RegisterDeviceTokenRequest(@NotBlank String token) {}
