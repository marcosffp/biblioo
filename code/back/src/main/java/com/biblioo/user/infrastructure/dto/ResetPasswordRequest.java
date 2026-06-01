package com.biblioo.user.infrastructure.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record ResetPasswordRequest(
    @NotBlank(message = "O token é obrigatório") String token,
    @NotBlank(message = "A nova senha é obrigatória")
        @Pattern(
            regexp = "^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$",
            message =
                "A senha deve ter no mínimo 8 caracteres, pelo menos uma letra maiúscula,"
                    + " um número e um caractere especial")
        String newPassword,
    @NotBlank(message = "A confirmação de senha é obrigatória") String confirmPassword) {}
