package com.biblioo.recommendation.infrastructure.service;

import com.biblioo.recommendation.domain.model.BookScore;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.time.LocalDate;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
public class RereadWorthItComputeService {

  public record ReadingData(Long bookId, int daysSinceRead, int userRating, LocalDate finishedAt) {}

  @PersistenceContext private EntityManager entityManager;

  /**
   * Busca todos os livros concluídos pelo usuário há pelo menos {@code minDaysSinceRead} dias.
   * O reread_count não é calculado aqui — ele é mantido no metadata do resultado persistido
   * porque a tabela shelf_items tem constraint única (shelf_id, book_id), impossibilitando
   * contar múltiplas conclusões por contagem de linhas.
   */
  @SuppressWarnings("unchecked")
  @Transactional(readOnly = true)
  public List<ReadingData> getEligibleReadings(Long userId, int minDaysSinceRead) {
    List<Object[]> rows =
        entityManager
            .createNativeQuery(
                """
                SELECT
                    si.book_id,
                    DATEDIFF(CURRENT_DATE, si.finished_at) AS days_since_read,
                    COALESCE(MAX(r.rating), 3)             AS user_rating,
                    si.finished_at
                FROM shelf_items si
                JOIN shelves sh ON sh.id = si.shelf_id
                LEFT JOIN (
                    SELECT rv.book_id, rv.rating
                    FROM reviews rv
                    JOIN content c ON c.id = rv.id AND c.user_id = :userId AND c.is_deleted = FALSE
                ) r ON r.book_id = si.book_id
                WHERE sh.user_id    = :userId
                  AND si.status     = 'COMPLETED'
                  AND si.deleted_at  IS NULL
                  AND sh.deleted_at  IS NULL
                  AND si.finished_at IS NOT NULL
                  AND DATEDIFF(CURRENT_DATE, si.finished_at) >= :minDays
                GROUP BY si.book_id, si.finished_at
                """)
            .setParameter("userId", userId)
            .setParameter("minDays", minDaysSinceRead)
            .getResultList();


    return rows.stream()
        .map(
            r ->
                new ReadingData(
                    ((Number) r[0]).longValue(),
                    ((Number) r[1]).intValue(),
                    ((Number) r[2]).intValue(),
                    toLocalDate(r[3])))
        .toList();
  }

  /**
   * Fallback para usuários sem leituras maduras (todos dentro do intervalo ideal).
   * Retorna os livros já lidos pelo usuário ordenados pela nota que ele deu —
   * são candidatos naturais para releitura, diferente do SimilarAuthors que sugere
   * livros ainda não lidos.
   */
  @SuppressWarnings("unchecked")
  @Transactional(readOnly = true)
  public List<BookScore> computeFallback(Long userId, int limit) {
    List<Object[]> rows =
        entityManager
            .createNativeQuery(
                """
                SELECT
                    si.book_id,
                    COALESCE(MAX(r.rating), 3.0) / 5.0 AS score
                FROM shelf_items si
                JOIN shelves sh ON sh.id = si.shelf_id
                LEFT JOIN (
                    SELECT rv.book_id, rv.rating
                    FROM reviews rv
                    JOIN content c ON c.id = rv.id AND c.user_id = :userId AND c.is_deleted = FALSE
                ) r ON r.book_id = si.book_id
                WHERE sh.user_id    = :userId
                  AND si.status     = 'COMPLETED'
                  AND si.deleted_at  IS NULL
                  AND sh.deleted_at  IS NULL
                  AND si.finished_at IS NOT NULL
                GROUP BY si.book_id
                ORDER BY COALESCE(MAX(r.rating), 3.0) DESC, (si.book_id + :userId) % 1000 ASC
                LIMIT :limit
                """)
            .setParameter("userId", userId)
            .setParameter("limit", limit)
            .getResultList();


    return rows.stream()
        .map(
            r ->
                new BookScore(
                    ((Number) r[0]).longValue(), ((Number) r[1]).doubleValue(), "fallback_read"))
        .toList();
  }

  /**
   * Retorna IDs de usuários que têm histórico de leitura mas ainda não têm resultado
   * REREAD_WORTH_IT salvo. Usado pelo inicializador para pré-computação no startup.
   */
  @SuppressWarnings("unchecked")
  @Transactional(readOnly = true)
  public List<Long> findUsersNeedingInitialization() {
    List<Object> rows =
        entityManager
            .createNativeQuery(
                """
                SELECT DISTINCT sh.user_id
                FROM shelves sh
                WHERE sh.deleted_at IS NULL
                  AND sh.user_id NOT IN (
                      SELECT rr.user_id
                      FROM recommendation_results rr
                      WHERE rr.trail_type = 'REREAD_WORTH_IT'
                  )
                """)
            .getResultList();

    return rows.stream().map(r -> ((Number) r).longValue()).toList();
  }

  private LocalDate toLocalDate(Object value) {
    if (value instanceof java.sql.Date d) return d.toLocalDate();
    if (value instanceof java.time.LocalDate ld) return ld;
    throw new IllegalArgumentException("Tipo inesperado para finished_at: " + value.getClass());
  }
}
