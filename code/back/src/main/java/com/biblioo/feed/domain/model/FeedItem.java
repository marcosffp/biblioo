package com.biblioo.feed.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(
    name = "feed_items",
    indexes = {@Index(name = "idx_feed_user_score", columnList = "user_id, score DESC, id DESC")},
    uniqueConstraints = {
      @UniqueConstraint(
          name = "uq_feed_user_content",
          columnNames = {"user_id", "content_id", "content_type"})
    })
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedItem {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "user_id", nullable = false)
  private Long userId;

  @Column(name = "content_id", nullable = false)
  private Long contentId;

  @Column(name = "content_type", nullable = false, length = 50)
  private String contentType;

  @Column(name = "author_id", nullable = false)
  private Long authorId;

  /** Epoch millis do conteúdo original — usado como score no Redis sorted set. */
  @Column(name = "score", nullable = false)
  private Long score;

  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt;
}
