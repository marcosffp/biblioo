package com.biblioo.user.infrastructure.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Credenciais de login")
public record LoginRequest(
    @Schema(description = "E-mail cadastrado", example = "leitor@biblioo.app")
        @NotBlank
        @Email
        @Size(max = 255)
        String email,
    @Schema(description = "Senha da conta", example = "minhasenha123") @NotBlank @Size(max = 100)
        String password) {}
