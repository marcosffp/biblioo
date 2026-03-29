package com.biblioo.user.infrastructure.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Resumo de um usuário para listagens")
public record UserSummaryResponse(
    @Schema(description = "ID interno do usuário", example = "1") Long id,
    @Schema(description = "Nome de usuário", example = "leitor_literario") String username,
    @Schema(
            description = "URL da foto de perfil",
            example = "https://res.cloudinary.com/exemplo/avatar.jpg")
        String avatarUrl,
    @Schema(
            description = "URL do banner de perfil",
            example = "https://res.cloudinary.com/exemplo/banner.jpg")
        String bannerUrl) {}
