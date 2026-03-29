package com.biblioo.user.infrastructure.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Perfil de um usuário")
public record UserProfileResponse(
    @Schema(description = "ID interno do usuário", example = "1") Long id,
    @Schema(description = "Nome de usuário", example = "leitor_literario") String username,
    @Schema(description = "E-mail (null em perfis restritos)", example = "leitor@biblioo.app")
        String email,
    @Schema(
            description = "Biografia (null em perfis restritos)",
            example = "Apaixonado por ficção científica.")
        String bio,
    @Schema(
            description = "URL da foto de perfil",
            example = "https://res.cloudinary.com/exemplo/avatar.jpg")
        String avatarUrl,
    @Schema(
            description = "URL do banner de perfil",
            example = "https://res.cloudinary.com/exemplo/banner.jpg")
        String bannerUrl,
    @Schema(description = "true se a conta é privada", example = "false") boolean isPrivate,
    @Schema(
            description = "true quando o perfil é privado e o viewer não tem acesso completo",
            example = "false")
        boolean restricted,
    @Schema(
            description = "Data de criação (null em perfis restritos)",
            example = "2026-03-27T14:52:13")
        String createdAt) {}
