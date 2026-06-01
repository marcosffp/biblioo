package com.biblioo.user.infrastructure.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Schema(description = "Dados para criação de conta")
public record RegisterRequest(
    @Schema(
            description = "Nome de usuário único (letras, números e _)",
            example = "leitor_literario")
        @NotBlank
        @Size(min = 3, max = 30)
        @Pattern(
            regexp = "^[a-zA-Z0-9_]+$",
            message = "Username can only contain letters, numbers and underscores")
        String username,
    @Schema(description = "E-mail válido", example = "leitor@biblioo.app")
        @NotBlank
        @Email
        @Size(max = 255)
        String email,
    @Schema(
            description =
                "Senha com no mínimo 8 caracteres, ao menos uma letra maiúscula e um caractere especial",
            example = "Minha@Senha1")
        @NotBlank
        @Size(min = 8, max = 100)
        @Pattern(
            regexp = "^(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).+$",
            message = "A senha deve conter ao menos uma letra maiúscula e um caractere especial")
        String password) {}
