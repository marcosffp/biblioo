package com.biblioo.feed.domain.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@SuperBuilder
@Entity
@Table(
    name = "reviews",
    indexes = {
      @Index(name = "idx_review_book_id", columnList = "book_id"),
      @Index(name = "idx_review_user_id", columnList = "user_id"),
      @Index(name = "idx_review_created_at", columnList = "created_at"),
      @Index(name = "idx_review_book_created", columnList = "book_id, created_at DESC"),
      @Index(name = "idx_review_is_deleted", columnList = "is_deleted")
    })
public class Review extends FeedContent {

  @Column(name = "book_id", nullable = false)
  private Long bookId;

  @Column(nullable = false)
  private Integer rating;

  @CreationTimestamp
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @UpdateTimestamp
  @Column(name = "updated_at")
  private LocalDateTime updatedAt;
}
