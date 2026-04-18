package com.biblioo.feed.domain.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@SuperBuilder
@Entity
@Table(
    name = "reviews",
    indexes = {
      @Index(name = "idx_review_book_id", columnList = "book_id"),
      @Index(name = "idx_review_book_created", columnList = "book_id")
    })
@PrimaryKeyJoinColumn(name = "id")
public class Review extends FeedContent {

  @Column(name = "book_id", nullable = false)
  private Long bookId;

  @Column(nullable = false)
  private Integer rating;
}
