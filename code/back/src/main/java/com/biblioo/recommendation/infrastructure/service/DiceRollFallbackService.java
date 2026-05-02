package com.biblioo.recommendation.infrastructure.service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
public class DiceRollFallbackService {

  @PersistenceContext private EntityManager entityManager;

  @SuppressWarnings("unchecked")
  @Transactional(readOnly = true)
  public List<Long> getPopularBookIds(int limit) {
    List<Object> rows =
        entityManager
            .createNativeQuery(
                """
                SELECT b.id
                FROM books b
                ORDER BY COALESCE(b.average_rating, 0) DESC, b.reader_count DESC
                LIMIT :limit
                """)
            .setParameter("limit", limit)
            .getResultList();

    log.info("[DiceRoll] Fallback global: {} livros disponíveis", rows.size());
    return rows.stream().map(r -> ((Number) r).longValue()).toList();
  }
}
