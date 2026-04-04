package com.biblioo.feed.domain.port.out;

public interface ShelfInteractionPort {
  /**
   * Garante que o livro está na estante do usuário e que o status de leitura está como COMPLETED
   * (lido). Se não estiver na estante, adiciona; se o status for outro, atualiza para COMPLETED.
   */
  void ensureBookReadStatusIsCompleted(Long userId, Long bookId);
}
