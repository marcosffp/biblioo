package com.biblioo.recommendation.infrastructure.persistence;

import com.biblioo.recommendation.domain.model.BookScore;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Repository
@RequiredArgsConstructor
public class RecommendationResultRepository {

  private final RecommendationResultJpaRepository jpaRepository;
  private final ObjectMapper objectMapper;

  @PersistenceContext private EntityManager entityManager;

  @Transactional
  public void upsert(Long userId, String trailType, List<BookScore> bookScores) {
    String booksJson = serialize(bookScores);

    entityManager
        .createNativeQuery(
            """
            INSERT INTO recommendation_results (user_id, trail_type, books, computed_at)
            VALUES (:userId, :trailType, :books, :computedAt)
            ON DUPLICATE KEY UPDATE
                books       = VALUES(books),
                computed_at = VALUES(computed_at)
            """)
        .setParameter("userId", userId)
        .setParameter("trailType", trailType)
        .setParameter("books", booksJson)
        .setParameter("computedAt", LocalDateTime.now())
        .executeUpdate();

    log.info(
        "[SQL] Upsert recommendation_results: user={} trail={} livros={}",
        userId,
        trailType,
        bookScores.size());
  }

  @Transactional(readOnly = true)
  public List<BookScore> findByUserId(Long userId, String trailType) {
    return jpaRepository
        .findByUserIdAndTrailType(userId, trailType)
        .map(result -> deserialize(result.getBooks()))
        .orElse(List.of());
  }

  private String serialize(List<BookScore> bookScores) {
    try {
      return objectMapper.writeValueAsString(bookScores);
    } catch (Exception ex) {
      throw new RuntimeException("Falha ao serializar book scores", ex);
    }
  }

  private List<BookScore> deserialize(String json) {
    try {
      return objectMapper.readValue(json, new TypeReference<List<BookScore>>() {});
    } catch (Exception ex) {
      log.warn("[SQL] Falha ao desserializar recomendações: {}", ex.getMessage());
      return List.of();
    }
  }
}
