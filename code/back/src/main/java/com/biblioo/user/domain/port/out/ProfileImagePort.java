package com.biblioo.user.domain.port.out;

import java.util.concurrent.CompletableFuture;

public interface ProfileImagePort {

  /** Faz upload da foto de perfil e retorna a URL segura. Executado de forma assíncrona. */
  CompletableFuture<String> uploadProfileImage(byte[] imageBytes, String userId);

  /** Faz upload do banner de perfil e retorna a URL segura. Executado de forma assíncrona. */
  CompletableFuture<String> uploadBannerImage(byte[] imageBytes, String userId);
}
