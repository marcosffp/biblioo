package com.biblioo.dna.infrastructure.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RenameLiteraryPhaseRequest(@NotBlank @Size(max = 200) String customName) {}
