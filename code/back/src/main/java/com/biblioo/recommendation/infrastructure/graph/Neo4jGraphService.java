package com.biblioo.recommendation.infrastructure.graph;

import com.biblioo.recommendation.domain.model.BookScore;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.neo4j.driver.Driver;
import org.neo4j.driver.Session;
import org.neo4j.driver.SessionConfig;
import org.neo4j.driver.exceptions.Neo4jException;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class Neo4jGraphService {

  private final Driver neo4jDriver;

  public void mergeReadRelationship(Long userId, Long bookId, String finishedAt, Long shelfItemId) {
    String cypher =
        """
        MERGE (u:User {user_id: $userId})
        ON CREATE SET u.created_at = datetime()

        MERGE (b:Book {book_id: $bookId})
        ON CREATE SET b.avg_rating   = 3.5,
                      b.review_count = 0

        MERGE (u)-[r:READ]->(b)
        ON CREATE SET r.finished_at   = datetime($finishedAt),
                      r.shelf_item_id = $shelfItemId
        ON MATCH  SET r.finished_at   = datetime($finishedAt)
        """;

    try (Session session = neo4jDriver.session()) {
      session.executeWrite(
          tx -> {
            tx.run(
                cypher,
                Map.of(
                    "userId", userId,
                    "bookId", bookId,
                    "finishedAt", finishedAt,
                    "shelfItemId", shelfItemId));
            return null;
          });
    } catch (Neo4jException ex) {
      log.error(
          "[Neo4j] Falha ao fazer MERGE READ: user={} book={} causa={}",
          userId,
          bookId,
          ex.getMessage());
      throw ex;
    }
  }

  public List<BookScore> computeT1(Long userId, Long bookId, int limit) {
    String cypher =
        """
        MATCH (target:Book {book_id: $bookId})<-[:READ]-(reader:User)-[:READ]->(candidate:Book)
        WHERE reader.user_id <> $userId
          AND candidate.book_id <> $bookId
          AND NOT EXISTS {
              MATCH (me:User {user_id: $userId})-[:READ]->(candidate)
          }

        WITH candidate,
             COUNT(DISTINCT reader)   AS co_readers,
             candidate.avg_rating     AS avg_rating,
             candidate.review_count   AS review_count

        WITH candidate, co_readers, avg_rating, review_count,
             SIZE([(t:Book {book_id: $bookId})<-[:READ]-(r:User) | r]) AS total_target_readers

        OPTIONAL MATCH (target2:Book {book_id: $bookId})-[:BELONGS_TO {position: 1}]->(pc:Category)
                       <-[:BELONGS_TO {position: 1}]-(candidate)
        WITH candidate, co_readers, avg_rating, review_count, total_target_readers,
             COUNT(DISTINCT pc) AS shared_primary_categories

        OPTIONAL MATCH (target3:Book {book_id: $bookId})-[:BELONGS_TO]->(ac:Category)
                       <-[:BELONGS_TO]-(candidate)
        WITH candidate, co_readers, avg_rating, review_count, total_target_readers,
             shared_primary_categories,
             COUNT(DISTINCT ac) AS shared_any_categories

        WITH candidate,
             (toFloat(co_readers) /
              toFloat(CASE WHEN total_target_readers = 0 THEN 1 ELSE total_target_readers END))
               * 0.40 AS co_read_score,

             (COALESCE(avg_rating, 3.0) / 5.0) * 0.30 AS rating_score,

             (CASE WHEN shared_primary_categories >= 1 THEN 1.0
                   WHEN shared_any_categories      >= 1 THEN 0.5
                   ELSE 0.0 END) * 0.20 AS category_score,

             (log(toFloat(CASE WHEN review_count > 1000 THEN 1000 ELSE review_count END) + 1.0)
               / log(1001.0)) * 0.10 AS popularity_score

        RETURN candidate.book_id AS book_id,
               co_read_score + rating_score + category_score + popularity_score AS score
        ORDER BY score DESC
        LIMIT $limit
        """;

    try (Session session = neo4jDriver.session(SessionConfig.forDatabase("neo4j"))) {
      return session.executeRead(
          tx -> {
            var result = tx.run(cypher, Map.of("userId", userId, "bookId", bookId, "limit", limit));
            return result.list(
                record ->
                    new BookScore(
                        record.get("book_id").asLong(), record.get("score").asDouble(), "graph"));
          });
    } catch (Neo4jException ex) {
      log.error(
          "[Neo4j] Query T1 falhou: user={} book={} causa={}", userId, bookId, ex.getMessage());
      throw ex;
    }
  }

  public void updateBookStats(Long bookId, double avgRating, int reviewCount) {
    String cypher =
        """
        MATCH (b:Book {book_id: $bookId})
        SET b.avg_rating   = $avgRating,
            b.review_count = $reviewCount
        """;

    try (Session session = neo4jDriver.session()) {
      session.executeWrite(
          tx -> {
            tx.run(
                cypher,
                Map.of("bookId", bookId, "avgRating", avgRating, "reviewCount", reviewCount));
            return null;
          });
    } catch (Neo4jException ex) {
      log.warn(
          "[Neo4j] Falha ao atualizar stats do livro: book={} causa={}", bookId, ex.getMessage());
    }
  }
}
