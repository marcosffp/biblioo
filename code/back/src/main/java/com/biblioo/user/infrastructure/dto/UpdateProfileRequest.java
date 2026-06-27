package com.biblioo.user.infrastructure.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Schema(
    description = "Campos para atualização do perfil. Envie apenas os campos que deseja alterar.")
public record UpdateProfileRequest(
    @Schema(description = "Nome de usuário único", example = "joao_silva")
        @Size(min = 3, max = 30)
        @Pattern(
            regexp = "^[a-zA-Z0-9_-]+$",
            message = "Username deve conter apenas letras, números, underscores e hífens")
        String username,
    @Schema(
            description = "Biografia do usuário",
            example = "Apaixonado por ficção científica e café.")
        @Size(max = 500)
        @Pattern(regexp = "^[^<>]*$", message = "Bio cannot contain HTML tags")
        String bio,
    @Schema(
            description = "URL da foto de perfil",
            example = "https://res.cloudinary.com/exemplo/avatar.jpg")
        @Size(max = 2048)
        String avatarUrl,
    @Schema(
            description = "URL do banner de perfil",
            example = "https://res.cloudinary.com/exemplo/banner.jpg")
        @Size(max = 2048)
        String bannerUrl) {}
