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
public class FavoriteGenreNowComputeService {

  @PersistenceContext private EntityManager entityManager;

  /**
   * Retorna os top N gêneros do usuário ordenados por afinidade.
   *
   * <p>Fórmula normalizada (evita que count bruto domine a nota):
   *
   * <ul>
   *   <li>count_ratio = books_in_genre / total_books_read → [0, 1]
   *   <li>rating_norm = avg_user_rating / 5.0 → [0, 1]
   *   <li>affinity = count_ratio * 0.60 + rating_norm * 0.40
   * </ul>
   *
   * <p>Com pesos iguais em escala, um gênero com nota alta compensa menor volume de leitura
   * (cenário: 4 livros nota 5.0 supera 8 livros nota 2.0).
   *
   * <p>Cada linha retornada contém: [category_id, genre_name, books_read_count, avg_user_rating]
   */
  @SuppressWarnings("unchecked")
  @Transactional(readOnly = true)
  public List<Long> resolveGenreNamesToIds(List<String> genreNames) {
    if (genreNames == null || genreNames.isEmpty()) return List.of();
    return ((List<Object>)
            entityManager
                .createNativeQuery("SELECT id FROM categories WHERE name IN (:names)")
                .setParameter("names", genreNames)
                .getResultList())
        .stream().map(r -> ((Number) r).longValue()).toList();
  }

  @SuppressWarnings("unchecked")
  @Transactional(readOnly = true)
  public List<Object[]> computeTopGenres(Long userId, int topGenresCount) {
    return entityManager
        .createNativeQuery(
            """
            SELECT
                bc.category_id,
                c.name                        AS genre_name,
                COUNT(DISTINCT si.id)         AS books_read_count,
                COALESCE(AVG(ur.rating), 3.5) AS avg_user_rating
            FROM shelf_items si
            JOIN shelves sh         ON si.shelf_id    = sh.id
            JOIN book_categories bc ON si.book_id     = bc.book_id
            JOIN categories c       ON bc.category_id = c.id
            LEFT JOIN (
                SELECT r.book_id, AVG(r.rating) AS rating
                FROM reviews r
                JOIN content ct ON ct.id = r.id
                WHERE ct.user_id    = :userId
                  AND ct.is_deleted = false
                GROUP BY r.book_id
            ) ur ON ur.book_id = si.book_id
            -- Total de livros concluídos para normalizar o count por gênero
            JOIN (
                SELECT COUNT(DISTINCT si2.id) AS total
                FROM shelf_items si2
                JOIN shelves sh2 ON si2.shelf_id = sh2.id
                WHERE sh2.user_id    = :userId
                  AND si2.status     = 'COMPLETED'
                  AND si2.deleted_at IS NULL
                  AND sh2.deleted_at IS NULL
            ) totals ON 1 = 1
            WHERE sh.user_id     = :userId
              AND si.status      = 'COMPLETED'
              AND si.deleted_at IS NULL
              AND sh.deleted_at IS NULL
            GROUP BY bc.category_id, c.name, totals.total
            ORDER BY
                (COUNT(DISTINCT si.id) * 1.0 / totals.total) * 0.60
                + (COALESCE(AVG(ur.rating), 3.5) / 5.0)      * 0.40
            DESC
            LIMIT :topGenresCount
            """)
        .setParameter("userId", userId)
        .setParameter("topGenresCount", topGenresCount)
        .getResultList();
  }

  /**
   * Estágio primário: livros nos gêneros com {@code rating_count >= minReviews}, scored por
   * avg_rating (70%) + popularidade (30%). Exclui livros já lidos/em leitura pelo usuário.
   */
  @SuppressWarnings("unchecked")
  @Transactional(readOnly = true)
  public List<BookScore> computeBooks(
      Long userId, List<Long> categoryIds, int candidateLimit, int minReviews) {
    if (categoryIds.isEmpty()) {
      return List.of();
    }

    List<Object[]> rows =
        entityManager
            .createNativeQuery(
                """
                SELECT
                    b.id AS book_id,
                    (COALESCE(b.average_rating, 3.0) / 5.0)              * 0.70
                    + (LOG(COALESCE(b.reader_count, 0) + 1) / LOG(1000)) * 0.30 AS score
                FROM books b
                JOIN book_categories bc ON bc.book_id = b.id
                WHERE bc.category_id IN (:categoryIds)
                  AND b.id NOT IN (
                      SELECT si.book_id
                      FROM shelf_items si
                      JOIN shelves sh ON sh.id = si.shelf_id
                      WHERE sh.user_id    = :userId
                        AND si.status    IN ('COMPLETED', 'READING')
                        AND si.deleted_at IS NULL
                        AND sh.deleted_at IS NULL
                  )
                  AND COALESCE(b.rating_count, 0) >= :minReviews
                GROUP BY b.id, b.average_rating, b.reader_count
                ORDER BY score DESC
                LIMIT :candidateLimit
                """)
            .setParameter("userId", userId)
            .setParameter("categoryIds", categoryIds)
            .setParameter("minReviews", minReviews)
            .setParameter("candidateLimit", candidateLimit)
            .getResultList();

    return rows.stream()
        .map(
            r ->
                new BookScore(
                    ((Number) r[0]).longValue(), ((Number) r[1]).doubleValue(), "sql_genre"))
        .toList();
  }

  /**
   * Estágio fallback: preenche slots restantes com livros dos mesmos gêneros ordenados por
   * reader_count (popularidade). Exclui os já retornados no primário e os já lidos/em leitura.
   *
   * <p>Usado quando não há dados de review suficientes — ex.: app recém-lançado.
   */
  @SuppressWarnings("unchecked")
  @Transactional(readOnly = true)
  public List<BookScore> computeBooksByPopularity(
      Long userId, List<Long> categoryIds, int limit, List<Long> excludeBookIds) {
    if (categoryIds.isEmpty()) {
      return List.of();
    }

    // Passa [-1] quando excludeBookIds está vazio para evitar IN () inválido no SQL
    List<Long> safeExclude = excludeBookIds.isEmpty() ? List.of(-1L) : excludeBookIds;

    List<Object[]> rows =
        entityManager
            .createNativeQuery(
                """
                SELECT
                    b.id AS book_id,
                    (LOG(COALESCE(b.reader_count, 0) + 1) / LOG(1000)) * 0.70
                    + (COALESCE(b.average_rating, 3.0) / 5.0)          * 0.30 AS score
                FROM books b
                JOIN book_categories bc ON bc.book_id = b.id
                WHERE bc.category_id IN (:categoryIds)
                  AND b.id NOT IN (:excludeBookIds)
                  AND b.id NOT IN (
                      SELECT si.book_id
                      FROM shelf_items si
                      JOIN shelves sh ON sh.id = si.shelf_id
                      WHERE sh.user_id    = :userId
                        AND si.status    IN ('COMPLETED', 'READING')
                        AND si.deleted_at IS NULL
                        AND sh.deleted_at IS NULL
                  )
                GROUP BY b.id, b.average_rating, b.reader_count
                ORDER BY score DESC
                LIMIT :limit
                """)
            .setParameter("userId", userId)
            .setParameter("categoryIds", categoryIds)
            .setParameter("excludeBookIds", safeExclude)
            .setParameter("limit", limit)
            .getResultList();

    return rows.stream()
        .map(
            r ->
                new BookScore(
                    ((Number) r[0]).longValue(),
                    ((Number) r[1]).doubleValue(),
                    "sql_genre_popular"))
        .toList();
  }
}
