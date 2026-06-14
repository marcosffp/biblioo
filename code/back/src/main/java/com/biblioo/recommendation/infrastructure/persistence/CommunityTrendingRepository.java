package com.biblioo.recommendation.infrastructure.persistence;

import com.biblioo.recommendation.domain.model.BookScore;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Repository
public class CommunityTrendingRepository {

  @PersistenceContext private EntityManager entityManager;

  /**
   * Verifica se o usuário já contribuiu com o tipo de evento informado para este livro dentro da
   * janela de deduplicação. A deduplicação é por tipo: "message" e "join" são janelas
   * independentes — um usuário pode contribuir 2.0 + 0.5 = 2.5 por livro por dia.
   */
  @Transactional(readOnly = true)
  public boolean hasContributedRecently(
      Long userId, Long bookId, String eventType, int windowHours) {
    Number count =
        (Number)
            entityManager
                .createNativeQuery(
                    """
                    SELECT COUNT(*)
                    FROM community_trending_dedup
                    WHERE user_id    = :userId
                      AND book_id    = :bookId
                      AND event_type = :eventType
                      AND contributed_at > DATE_SUB(NOW(), INTERVAL :hours HOUR)
                    """)
                .setParameter("userId", userId)
                .setParameter("bookId", bookId)
                .setParameter("eventType", eventType)
                .setParameter("hours", windowHours)
                .getSingleResult();
    return count.longValue() > 0;
  }

  /**
   * Registra ou renova a contribuição do usuário para o livro e tipo de evento. O upsert usa a
   * chave única {@code (user_id, book_id, event_type)}, reiniciando a janela de 24h após cada
   * contribuição válida.
   */
  @Transactional
  public void registerContribution(Long userId, Long bookId, String eventType) {
    entityManager
        .createNativeQuery(
            """
            INSERT INTO community_trending_dedup (user_id, book_id, event_type, contributed_at)
            VALUES (:userId, :bookId, :eventType, NOW())
            ON DUPLICATE KEY UPDATE contributed_at = VALUES(contributed_at)
            """)
        .setParameter("userId", userId)
        .setParameter("bookId", bookId)
        .setParameter("eventType", eventType)
        .executeUpdate();
  }

  /**
   * Aplica decaimento exponencial ao score atual e adiciona o peso do evento em uma única operação
   * atômica. Fórmula: new_score = current_score × (1 - decayRate)^hours_elapsed + weight
   */
  @Transactional
  public void incrementScore(Long bookId, double weight, double decayPerHour) {
    entityManager
        .createNativeQuery(
            """
            INSERT INTO community_trending_scores (book_id, current_score, last_updated)
            VALUES (:bookId, :weight, NOW())
            ON DUPLICATE KEY UPDATE
                current_score = current_score
                    * POW(1.0 - :decayRate, TIMESTAMPDIFF(SECOND, last_updated, NOW()) / 3600.0)
                    + :weight,
                last_updated = NOW()
            """)
        .setParameter("bookId", bookId)
        .setParameter("weight", weight)
        .setParameter("decayRate", decayPerHour)
        .executeUpdate();

  }

  /**
   * Retorna livros com score ativo (após decaimento) acima do limiar mínimo, excluindo livros já
   * lidos ou em leitura pelo usuário. Ordenação decrescente por score.
   */
  @SuppressWarnings("unchecked")
  @Transactional(readOnly = true)
  public List<BookScore> findOrganicBooks(
      Long userId, double minScore, double decayPerHour, int limit) {

    List<Object[]> rows =
        entityManager
            .createNativeQuery(
                """
                WITH scored AS (
                    SELECT
                        cts.book_id,
                        cts.current_score
                            * POW(1.0 - :decayRate, TIMESTAMPDIFF(SECOND, cts.last_updated, NOW()) / 3600.0)
                            AS decayed_score
                    FROM community_trending_scores cts
                ),
                filtered AS (
                    SELECT s.book_id, s.decayed_score
                    FROM scored s
                    WHERE s.decayed_score >= :minScore
                      AND NOT EXISTS (
                          SELECT 1
                          FROM shelf_items si
                          JOIN shelves sh ON sh.id = si.shelf_id
                          WHERE sh.user_id    = :userId
                            AND si.book_id    = s.book_id
                            AND si.status    IN ('COMPLETED', 'READING')
                            AND si.deleted_at  IS NULL
                            AND sh.deleted_at  IS NULL
                      )
                )
                SELECT book_id, decayed_score
                FROM filtered
                ORDER BY decayed_score DESC, book_id ASC
                LIMIT :limit
                """)
            .setParameter("decayRate", decayPerHour)
            .setParameter("minScore", minScore)
            .setParameter("userId", userId)
            .setParameter("limit", limit)
            .getResultList();

    return rows.stream()
        .map(r -> new BookScore(((Number) r[0]).longValue(), ((Number) r[1]).doubleValue(), "trending"))
        .toList();
  }
}
