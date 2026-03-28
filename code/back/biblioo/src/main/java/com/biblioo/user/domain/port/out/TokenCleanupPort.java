package com.biblioo.user.domain.port.out;

public interface TokenCleanupPort {

  /** Remove tokens expirados e já utilizados do usuário. Executado de forma assíncrona. */
  void scheduleCleanup(Long userId);
}
