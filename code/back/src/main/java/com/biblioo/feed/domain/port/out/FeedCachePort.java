package com.biblioo.feed.domain.port.out;

import com.biblioo.feed.domain.model.FeedItem;
import java.util.List;

public interface FeedCachePort {

  /** Retorna página do feed a partir do cursor (null = primeira página). */
  List<FeedItem> getCachedPage(Long userId, String cursor, int size);

  /** Verifica se o cache já está aquecido para o usuário. */
  boolean isCacheWarm(Long userId);

  /** Popula o cache com a lista de itens fornecida (sobrescreve). */
  void populate(Long userId, List<FeedItem> items);

  /** Adiciona item ao cache apenas se a chave já existir (usuário ativo). */
  void addIfActive(Long userId, FeedItem item);

  /** Conta itens com score > {@code sinceScore} (novos itens não vistos). */
  long countNewItems(Long userId, long sinceScore);

  /** Retorna o número de itens no cache a partir do cursor (itens restantes). */
  long countRemaining(Long userId, String cursor);

  /** Remove o cache do feed do usuário. */
  void evict(Long userId);
}
