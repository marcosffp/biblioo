package com.biblioo.community.infrastructure.dto;

import jakarta.validation.constraints.NotBlank;

public record RejectVotingRequest(
    @NotBlank(message = "A justificativa de rejeição é obrigatória") String reason) {}
