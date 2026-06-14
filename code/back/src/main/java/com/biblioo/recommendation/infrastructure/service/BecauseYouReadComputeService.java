package com.biblioo.recommendation.infrastructure.service;

import com.biblioo.recommendation.domain.model.BookScore;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class BecauseYouReadComputeService {

  @PersistenceContext private EntityManager entityManager;

  @org.springframework.transaction.annotation.Transactional(readOnly = true)
  public String getBookTitle(Long bookId) {
    List<?> result =
        entityManager
            .createNativeQuery("SELECT title FROM books WHERE id = :bookId")
            .setParameter("bookId", bookId)
            .getResultList();
    return result.isEmpty() ? null : (String) result.get(0);
  }

  /** Fallback SQL quando o Neo4j está indisponível ou retorna vazio. */
  @SuppressWarnings("unchecked")
  public List<BookScore> compute(Long userId, Long bookId) {
    log.warn("[BYR-Compute] Executando fallback SQL para user={} book={}", userId, bookId);

    List<Long> categoryIds =
        entityManager
            .createNativeQuery(
                """
                SELECT bc.category_id
                FROM book_categories bc
                WHERE bc.book_id = :bookId
                """)
            .setParameter("bookId", bookId)
            .getResultList();

    if (categoryIds.isEmpty()) {
      log.warn("[BYR-Compute] Nenhuma categoria encontrada para book={}", bookId);
      return List.of();
    }

    Long primaryCategoryId = categoryIds.get(0);

    List<Object[]> rows =
        entityManager
            .createNativeQuery(
                """
                SELECT
                    b.id AS book_id,
                    (COALESCE(b.average_rating, 3.0) / 5.0) * 0.5
                    + (LOG(COALESCE(b.reader_count, 0) + 1) / LOG(1000)) * 0.3
                    + (CASE
                        WHEN MAX(CASE WHEN bc.category_id = :primaryCategoryId THEN 1 ELSE 0 END) = 1
                            THEN 0.2
                        WHEN MAX(CASE WHEN bc.category_id IN (:categoryIds) THEN 1 ELSE 0 END) = 1
                            THEN 0.1
                        ELSE 0.0
                       END) AS score
                FROM books b
                JOIN book_categories bc ON bc.book_id = b.id
                                       AND bc.category_id IN (:categoryIds)
                WHERE b.id NOT IN (
                    SELECT si.book_id
                    FROM shelf_items si
                    JOIN shelves s ON s.id = si.shelf_id
                    WHERE s.user_id = :userId
                      AND si.status IN ('COMPLETED', 'READING')
                      AND si.deleted_at IS NULL
                )
                AND b.id != :bookId
                GROUP BY b.id, b.average_rating, b.reader_count
                ORDER BY score DESC
                LIMIT 20
                """)
            .setParameter("userId", userId)
            .setParameter("bookId", bookId)
            .setParameter("primaryCategoryId", primaryCategoryId)
            .setParameter("categoryIds", categoryIds)
            .getResultList();

    return rows.stream()
        .map(
            row ->
                new BookScore(
                    ((Number) row[0]).longValue(), ((Number) row[1]).doubleValue(), "sql_fallback"))
        .toList();
  }
}
