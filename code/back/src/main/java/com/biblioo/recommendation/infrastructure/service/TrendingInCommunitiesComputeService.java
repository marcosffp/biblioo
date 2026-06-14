package com.biblioo.recommendation.infrastructure.service;

import com.biblioo.recommendation.domain.model.BookScore;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
public class TrendingInCommunitiesComputeService {

  @PersistenceContext private EntityManager entityManager;

  /**
   * Fallback: livros mais bem avaliados adicionados ao catálogo nos últimos {@code windowDays}
   * dias, excluindo livros já lidos/em leitura pelo usuário e os já presentes no orgânico.
   * Ordenação por avaliação média decrescente.
   */
  @SuppressWarnings("unchecked")
  @Transactional(readOnly = true)
  public List<BookScore> computeFallback(
      Long userId, int limit, List<Long> excludeBookIds, int windowDays) {

    List<Long> safeExclude = excludeBookIds.isEmpty() ? List.of(-1L) : excludeBookIds;

    List<Object[]> rows =
        entityManager
            .createNativeQuery(
                """
                SELECT
                    b.id AS book_id,
                    COALESCE(b.average_rating, 3.0) / 5.0 AS score
                FROM books b
                WHERE b.created_at >= DATE_SUB(NOW(), INTERVAL :days DAY)
                  AND b.id NOT IN (:excludeBookIds)
                  AND NOT EXISTS (
                      SELECT 1
                      FROM shelf_items si
                      JOIN shelves sh ON sh.id = si.shelf_id
                      WHERE sh.user_id    = :userId
                        AND si.book_id    = b.id
                        AND si.status    IN ('COMPLETED', 'READING')
                        AND si.deleted_at  IS NULL
                        AND sh.deleted_at  IS NULL
                  )
                ORDER BY COALESCE(b.average_rating, 0) DESC, b.id ASC
                LIMIT :limit
                """)
            .setParameter("days", windowDays)
            .setParameter("excludeBookIds", safeExclude)
            .setParameter("userId", userId)
            .setParameter("limit", limit)
            .getResultList();


    return rows.stream()
        .map(r -> new BookScore(((Number) r[0]).longValue(), ((Number) r[1]).doubleValue(), "fallback_new"))
        .toList();
  }
}
