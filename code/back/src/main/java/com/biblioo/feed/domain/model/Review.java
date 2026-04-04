package com.biblioo.feed.domain.model;

import com.biblioo.books.domain.model.Book;
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
      @Index(name = "idx_review_user_id", columnList = "user_id"),
      @Index(name = "idx_review_created_at", columnList = "created_at"),
      @Index(name = "idx_review_book_created", columnList = "book_id, created_at DESC"),
      @Index(name = "idx_review_is_deleted", columnList = "is_deleted")
    })
public class Review extends FeedContent {

  // Livro associado à review
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "book_id", nullable = false)
  private Book book;

  // Avaliação do livro (nota de 1 a 5, por exemplo)
  @Column(nullable = false)
  private Integer rating;
}
