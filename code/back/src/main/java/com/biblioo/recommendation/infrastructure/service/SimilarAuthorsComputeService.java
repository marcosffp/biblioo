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
public class SimilarAuthorsComputeService {

  @PersistenceContext private EntityManager entityManager;

  /**
   * Nível 1 — Autores confirmados.
   *
   * <p>Autores de livros concluídos com avaliação ≥ {@code minRating} e finalizados há mais de
   * {@code minDaysSinceCompleted} dias. Livros sem avaliação são tratados como nota neutra (3
   * estrelas), que está abaixo do limiar padrão de 4 — não geram autor confirmado.
   *
   * <p>Score = 0.6 + 0.2 × (user_author_avg − 4) + 0.2 × (book_avg / 5) → intervalo [0.6, 1.0].
   * O componente user_author_avg torna o score específico por usuário, quebrando a ordem idêntica
   * que ocorria quando apenas a média global do livro era usada.
   */
  @SuppressWarnings("unchecked")
  @Transactional(readOnly = true)
  public List<BookScore> computeLevel1(
      Long userId, int minRating, int minDaysSinceCompleted, int limit) {

    List<Object[]> rows =
        entityManager
            .createNativeQuery(
                """
                WITH confirmed_authors AS (
                    SELECT ba.author, AVG(COALESCE(r.rating, 3)) AS user_author_avg
                    FROM shelf_items si
                    JOIN shelves sh      ON sh.id       = si.shelf_id
                    JOIN book_authors ba ON ba.book_id  = si.book_id
                    LEFT JOIN (
                        SELECT rv.book_id, rv.rating
                        FROM reviews rv
                        JOIN content c ON c.id = rv.id AND c.user_id = :userId AND c.is_deleted = FALSE
                    ) r ON r.book_id = si.book_id
                    WHERE sh.user_id     = :userId
                      AND si.status      = 'COMPLETED'
                      AND si.deleted_at  IS NULL
                      AND sh.deleted_at  IS NULL
                      AND si.finished_at IS NOT NULL
                      AND DATEDIFF(CURRENT_DATE, si.finished_at) > :minDays
                      AND COALESCE(r.rating, 3) >= :minRating
                    GROUP BY ba.author
                )
                SELECT book_id, score
                FROM (
                    SELECT DISTINCT
                        b.id AS book_id,
                        0.6 + 0.2 * (ca.user_author_avg - 4) + 0.2 * (COALESCE(b.average_rating, 3.0) / 5.0) AS score
                    FROM book_authors ba
                    JOIN confirmed_authors ca ON ca.author  = ba.author
                    JOIN books b              ON b.id       = ba.book_id
                    WHERE b.id NOT IN (
                        SELECT si2.book_id
                        FROM shelf_items si2
                        JOIN shelves sh2 ON sh2.id = si2.shelf_id
                        WHERE sh2.user_id    = :userId
                          AND si2.status    IN ('COMPLETED', 'READING')
                          AND si2.deleted_at IS NULL
                          AND sh2.deleted_at IS NULL
                    )
                ) deduped
                ORDER BY score DESC, (book_id + :userId) % 1000 ASC
                LIMIT :limit
                """)
            .setParameter("userId", userId)
            .setParameter("minRating", minRating)
            .setParameter("minDays", minDaysSinceCompleted)
            .setParameter("limit", limit)
            .getResultList();

    log.info("[SA] Nível 1 (autores confirmados): {} candidatos para userId={}", rows.size(), userId);

    return rows.stream()
        .map(r -> new BookScore(((Number) r[0]).longValue(), ((Number) r[1]).doubleValue(), "confirmed_author"))
        .toList();
  }

  /**
   * Nível 2 — Autores descobertos por leitores similares (collaborative filtering SQL).
   *
   * <p>Encontra usuários com padrão de leitura parecido (aprovaram os mesmos livros com nota ≥
   * {@code minRating}) e expõe autores que esses leitores aprovaram mas o usuário nunca leu.
   *
   * <p>Score = 0.3 + 0.4 × (avgRating / 5.0) → intervalo [0.3, 0.7] (expansão de repertório).
   * Empates são desempatados por {@code (book_id + userId) % 1000} para variar a ordem entre
   * usuários diferentes sem comprometer a reprodutibilidade por usuário.
   */
  @SuppressWarnings("unchecked")
  @Transactional(readOnly = true)
  public List<BookScore> computeLevel2(
      Long userId, int minRating, int limit, int similarUsersLimit) {

    List<Object[]> rows =
        entityManager
            .createNativeQuery(
                """
                WITH user_approved_books AS (
                    SELECT si.book_id
                    FROM shelf_items si
                    JOIN shelves sh    ON sh.id      = si.shelf_id
                    LEFT JOIN (
                        SELECT rv.book_id, rv.rating
                        FROM reviews rv
                        JOIN content c ON c.id = rv.id AND c.user_id = :userId AND c.is_deleted = FALSE
                    ) r ON r.book_id = si.book_id
                    WHERE sh.user_id    = :userId
                      AND si.status     = 'COMPLETED'
                      AND si.deleted_at  IS NULL
                      AND sh.deleted_at  IS NULL
                      AND COALESCE(r.rating, 3) >= :minRating
                ),
                similar_users AS (
                    SELECT sh2.user_id, COUNT(*) AS common_books
                    FROM user_approved_books uab
                    JOIN shelf_items si2   ON si2.book_id   = uab.book_id
                                          AND si2.status    = 'COMPLETED'
                                          AND si2.deleted_at IS NULL
                    JOIN shelves sh2       ON sh2.id         = si2.shelf_id
                                          AND sh2.user_id   != :userId
                                          AND sh2.deleted_at IS NULL
                    LEFT JOIN (
                        SELECT rv.book_id, rv.rating, c.user_id
                        FROM reviews rv
                        JOIN content c ON c.id = rv.id AND c.is_deleted = FALSE
                    ) r2 ON r2.book_id = si2.book_id AND r2.user_id = sh2.user_id
                    WHERE COALESCE(r2.rating, 3) >= :minRating
                    GROUP BY sh2.user_id
                    ORDER BY common_books DESC
                    LIMIT :similarUsersLimit
                ),
                user_known_authors AS (
                    SELECT DISTINCT ba.author
                    FROM shelf_items si
                    JOIN shelves sh     ON sh.id       = si.shelf_id
                    JOIN book_authors ba ON ba.book_id = si.book_id
                    WHERE sh.user_id    = :userId
                      AND si.deleted_at IS NULL
                      AND sh.deleted_at IS NULL
                ),
                discovered_authors AS (
                    SELECT DISTINCT ba.author
                    FROM similar_users su
                    JOIN shelves sh    ON sh.user_id   = su.user_id
                                      AND sh.deleted_at IS NULL
                    JOIN shelf_items si ON si.shelf_id = sh.id
                                       AND si.status   = 'COMPLETED'
                                       AND si.deleted_at IS NULL
                    LEFT JOIN (
                        SELECT rv.book_id, rv.rating, c.user_id
                        FROM reviews rv
                        JOIN content c ON c.id = rv.id AND c.is_deleted = FALSE
                    ) r ON r.book_id = si.book_id AND r.user_id = su.user_id
                    JOIN book_authors ba ON ba.book_id = si.book_id
                    WHERE COALESCE(r.rating, 3) >= :minRating
                      AND ba.author NOT IN (SELECT author FROM user_known_authors)
                )
                SELECT book_id, score
                FROM (
                    SELECT DISTINCT
                        b.id AS book_id,
                        0.3 + 0.4 * (COALESCE(b.average_rating, 3.0) / 5.0) AS score
                    FROM discovered_authors da
                    JOIN book_authors ba ON ba.author = da.author
                    JOIN books b         ON b.id      = ba.book_id
                    WHERE b.id NOT IN (
                        SELECT si2.book_id
                        FROM shelf_items si2
                        JOIN shelves sh2 ON sh2.id = si2.shelf_id
                        WHERE sh2.user_id    = :userId
                          AND si2.status    IN ('COMPLETED', 'READING')
                          AND si2.deleted_at IS NULL
                          AND sh2.deleted_at IS NULL
                    )
                ) deduped
                ORDER BY score DESC, (book_id + :userId) % 1000 ASC
                LIMIT :limit
                """)
            .setParameter("userId", userId)
            .setParameter("minRating", minRating)
            .setParameter("similarUsersLimit", similarUsersLimit)
            .setParameter("limit", limit)
            .getResultList();

    log.info("[SA] Nível 2 (autores descobertos): {} candidatos para userId={}", rows.size(), userId);

    return rows.stream()
        .map(r -> new BookScore(((Number) r[0]).longValue(), ((Number) r[1]).doubleValue(), "discovered_author"))
        .toList();
  }

  /**
   * Retorna IDs de usuários sem resultado SIMILAR_AUTHORS salvo. Usado pelo inicializador
   * para pré-computação no startup (CT-20).
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
                      WHERE rr.trail_type = 'SIMILAR_AUTHORS'
                  )
                """)
            .getResultList();

    return rows.stream().map(r -> ((Number) r).longValue()).toList();
  }

  /**
   * Fallback global — usado quando nenhum candidato de nível 1 ou 2 foi encontrado.
   * Retorna os livros mais bem avaliados que o usuário ainda não leu.
   */
  @SuppressWarnings("unchecked")
  @Transactional(readOnly = true)
  public List<BookScore> computeFallback(Long userId, int limit) {
    List<Object[]> rows =
        entityManager
            .createNativeQuery(
                """
                SELECT
                    b.id                                   AS book_id,
                    COALESCE(b.average_rating, 3.0) / 5.0  AS score
                FROM books b
                WHERE b.id NOT IN (
                    SELECT si.book_id
                    FROM shelf_items si
                    JOIN shelves sh ON sh.id = si.shelf_id
                    WHERE sh.user_id    = :userId
                      AND si.status    IN ('COMPLETED', 'READING')
                      AND si.deleted_at IS NULL
                      AND sh.deleted_at IS NULL
                )
                ORDER BY COALESCE(b.average_rating, 0) DESC, (b.id + :userId) % 1000 ASC
                LIMIT :limit
                """)
            .setParameter("userId", userId)
            .setParameter("limit", limit)
            .getResultList();

    log.info("[SA] Fallback global: {} livros para userId={}", rows.size(), userId);

    return rows.stream()
        .map(r -> new BookScore(((Number) r[0]).longValue(), ((Number) r[1]).doubleValue(), "fallback_global"))
        .toList();
  }
}
