package com.biblioo.recommendation.infrastructure.persistence;

import com.biblioo.recommendation.domain.model.BecauseYouReadResult;
import com.biblioo.recommendation.domain.model.BookScore;
import com.biblioo.recommendation.domain.model.FavoriteGenreNowResult;
import com.biblioo.recommendation.domain.model.RecommendationResult;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
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


  }

  @Transactional
  public void upsertWithMetadata(
      Long userId, String trailType, List<BookScore> bookScores, List<String> genres) {
    String booksJson = serialize(bookScores);
    String metadataJson = serializeGenres(genres);

    entityManager
        .createNativeQuery(
            """
            INSERT INTO recommendation_results (user_id, trail_type, books, metadata, computed_at)
            VALUES (:userId, :trailType, :books, :metadata, :computedAt)
            ON DUPLICATE KEY UPDATE
                books       = VALUES(books),
                metadata    = VALUES(metadata),
                computed_at = VALUES(computed_at)
            """)
        .setParameter("userId", userId)
        .setParameter("trailType", trailType)
        .setParameter("books", booksJson)
        .setParameter("metadata", metadataJson)
        .setParameter("computedAt", LocalDateTime.now())
        .executeUpdate();


  }

  @Transactional(readOnly = true)
  public List<BookScore> findByUserId(Long userId, String trailType) {
    return jpaRepository
        .findByUserIdAndTrailType(userId, trailType)
        .map(result -> deserialize(result.getBooks()))
        .orElse(List.of());
  }

  @Transactional(readOnly = true)
  public Optional<RecommendationResult> findResultEntity(Long userId, String trailType) {
    return jpaRepository.findByUserIdAndTrailType(userId, trailType);
  }

  @Transactional
  public void upsertWithRawMetadata(
      Long userId, String trailType, List<BookScore> bookScores, String rawMetadata) {
    String booksJson = serialize(bookScores);

    entityManager
        .createNativeQuery(
            """
            INSERT INTO recommendation_results (user_id, trail_type, books, metadata, computed_at)
            VALUES (:userId, :trailType, :books, :metadata, :computedAt)
            ON DUPLICATE KEY UPDATE
                books       = VALUES(books),
                metadata    = VALUES(metadata),
                computed_at = VALUES(computed_at)
            """)
        .setParameter("userId", userId)
        .setParameter("trailType", trailType)
        .setParameter("books", booksJson)
        .setParameter("metadata", rawMetadata)
        .setParameter("computedAt", LocalDateTime.now())
        .executeUpdate();


  }

  @Transactional
  public void upsertByr(Long userId, List<BookScore> bookScores, String seedBookTitle) {
    String booksJson = serialize(bookScores);
    String metadataJson = serializeSeedBook(seedBookTitle);

    entityManager
        .createNativeQuery(
            """
            INSERT INTO recommendation_results (user_id, trail_type, books, metadata, computed_at)
            VALUES (:userId, 'BECAUSE_YOU_READ', :books, :metadata, :computedAt)
            ON DUPLICATE KEY UPDATE
                books       = VALUES(books),
                metadata    = VALUES(metadata),
                computed_at = VALUES(computed_at)
            """)
        .setParameter("userId", userId)
        .setParameter("books", booksJson)
        .setParameter("metadata", metadataJson)
        .setParameter("computedAt", LocalDateTime.now())
        .executeUpdate();


  }

  @Transactional(readOnly = true)
  public BecauseYouReadResult findBecauseYouReadResult(Long userId) {
    return jpaRepository
        .findByUserIdAndTrailType(userId, "BECAUSE_YOU_READ")
        .map(r -> new BecauseYouReadResult(deserializeSeedBookTitle(r.getMetadata()), deserialize(r.getBooks())))
        .orElse(new BecauseYouReadResult(null, List.of()));
  }

  @Transactional(readOnly = true)
  public FavoriteGenreNowResult findFavoriteGenreNowResult(Long userId) {
    return jpaRepository
        .findByUserIdAndTrailType(userId, "FAVORITE_GENRE_NOW")
        .map(
            r ->
                new FavoriteGenreNowResult(
                    deserializeGenres(r.getMetadata()), deserialize(r.getBooks())))
        .orElse(new FavoriteGenreNowResult(List.of(), List.of()));
  }

  private String serialize(List<BookScore> bookScores) {
    try {
      return objectMapper.writeValueAsString(bookScores);
    } catch (Exception ex) {
      throw new RuntimeException("Falha ao serializar book scores", ex);
    }
  }

  private String serializeGenres(List<String> genres) {
    try {
      return objectMapper.writeValueAsString(genres);
    } catch (Exception ex) {
      throw new RuntimeException("Falha ao serializar gêneros", ex);
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

  private List<String> deserializeGenres(String json) {
    if (json == null) return List.of();
    try {
      return objectMapper.readValue(json, new TypeReference<List<String>>() {});
    } catch (Exception ex) {
      log.warn("[SQL] Falha ao desserializar gêneros: {}", ex.getMessage());
      return List.of();
    }
  }

  private String serializeSeedBook(String seedBookTitle) {
    try {
      return objectMapper.writeValueAsString(java.util.Map.of("seedBookTitle", seedBookTitle != null ? seedBookTitle : ""));
    } catch (Exception ex) {
      throw new RuntimeException("Falha ao serializar seedBookTitle", ex);
    }
  }

  private String deserializeSeedBookTitle(String json) {
    if (json == null) return null;
    try {
      JsonNode node = objectMapper.readTree(json);
      JsonNode field = node.get("seedBookTitle");
      return (field != null && !field.asText().isEmpty()) ? field.asText() : null;
    } catch (Exception ex) {
      log.warn("[SQL] Falha ao desserializar seedBookTitle: {}", ex.getMessage());
      return null;
    }
  }
}
