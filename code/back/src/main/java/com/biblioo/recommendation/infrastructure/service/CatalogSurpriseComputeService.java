package com.biblioo.recommendation.infrastructure.service;

import com.biblioo.recommendation.domain.model.BookScore;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
public class CatalogSurpriseComputeService {

  @PersistenceContext private EntityManager entityManager;

  @Value("${recommendation.catalog-surprise.distance-threshold:0.2}")
  private double distanceThreshold;

  @Value("${recommendation.catalog-surprise.min-rating:3.0}")
  private double minRating;

  @Value("${recommendation.catalog-surprise.min-rating-count:5}")
  private int minRatingCount;

  /**
   * Busca livros candidatos de categorias "distantes" do perfil de leitura do usuário.
   *
   * <p>Uma categoria é distante quando seu peso no histórico concluído é menor que
   * {@code distanceThreshold}. Categorias ausentes do histórico têm peso implícito 0.0 e também
   * são incluídas — cobrindo naturalmente o cold start sem lógica adicional.
   *
   * <p>Livros com qualquer status ativo (COMPLETED, READING, REREADING, ABANDONED) são excluídos
   * para não recomendar o que o usuário já interagiu diretamente. WANT_TO_READ permanece
   * elegível, pois o usuário manifestou interesse mas ainda não leu.
   *
   * <p>Score base de qualidade global: avg_rating (60%) + popularidade log-normalizada (40%).
   * O Thompson Sampling em {@link CatalogSurpriseBanditService} aplica o fator de exploração
   * sobre esse score base no momento do request.
   */
  @SuppressWarnings("unchecked")
  @Transactional(readOnly = true)
  public List<BookScore> getCandidates(Long userId, int limit) {
    List<Object[]> rows =
        entityManager
            .createNativeQuery(
                """
                WITH user_completed AS (
                    SELECT si.book_id,
                           COUNT(*) OVER () AS total_completed
                    FROM shelf_items si
                    JOIN shelves sh ON sh.id = si.shelf_id
                    WHERE sh.user_id    = :userId
                      AND si.status     = 'COMPLETED'
                      AND si.deleted_at IS NULL
                      AND sh.deleted_at IS NULL
                ),
                category_weights AS (
                    SELECT bc.category_id,
                           COUNT(DISTINCT uc.book_id) * 1.0
                               / NULLIF(MAX(uc.total_completed), 0) AS weight
                    FROM user_completed uc
                    JOIN book_categories bc ON bc.book_id = uc.book_id
                    GROUP BY bc.category_id
                ),
                distant_categories AS (
                    SELECT c.id AS category_id
                    FROM categories c
                    LEFT JOIN category_weights cw ON cw.category_id = c.id
                    WHERE COALESCE(cw.weight, 0.0) < :distanceThreshold
                )
                SELECT b.id AS book_id,
                       (COALESCE(b.average_rating, 3.0) / 5.0)               * 0.6
                       + (LOG(COALESCE(b.reader_count, 0) + 1) / LOG(1000))  * 0.4 AS base_score
                FROM books b
                JOIN book_categories bc ON bc.book_id = b.id
                JOIN distant_categories dc ON dc.category_id = bc.category_id
                WHERE b.id NOT IN (
                    SELECT si2.book_id
                    FROM shelf_items si2
                    JOIN shelves sh2 ON sh2.id = si2.shelf_id
                    WHERE sh2.user_id    = :userId
                      AND si2.status    IN ('COMPLETED', 'READING', 'REREADING', 'ABANDONED')
                      AND si2.deleted_at IS NULL
                      AND sh2.deleted_at IS NULL
                )
                  AND COALESCE(b.average_rating, 0.0) >= :minRating
                  AND COALESCE(b.rating_count, 0) >= :minRatingCount
                GROUP BY b.id, b.average_rating, b.reader_count
                ORDER BY base_score DESC
                LIMIT :limit
                """)
            .setParameter("userId", userId)
            .setParameter("distanceThreshold", distanceThreshold)
            .setParameter("minRating", minRating)
            .setParameter("minRatingCount", minRatingCount)
            .setParameter("limit", limit)
            .getResultList();

    log.info(
        "[CS-Compute] {} candidatos de categorias distantes para userId={} threshold={}",
        rows.size(),
        userId,
        distanceThreshold);

    return rows.stream()
        .map(
            r ->
                new BookScore(
                    ((Number) r[0]).longValue(), ((Number) r[1]).doubleValue(), "sql_distant"))
        .toList();
  }
}
