package com.biblioo.books.domain.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import tools.jackson.databind.annotation.JsonDeserialize;
import tools.jackson.databind.annotation.JsonSerialize;

@Entity
@Table(
    name = "books",
    indexes = {
      @Index(name = "idx_isbn", columnList = "isbn"),
      @Index(name = "idx_title", columnList = "title"),
      @Index(name = "idx_published_at", columnList = "published_at"),
      @Index(name = "idx_language", columnList = "language"),
      @Index(name = "idx_rating", columnList = "average_rating"),
      @Index(name = "idx_created_at", columnList = "created_at")
    })
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Book {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 20, unique = true)
  private String isbn;

  @Column(nullable = false, length = 500)
  private String title;

  @ElementCollection(fetch = FetchType.EAGER)
  @CollectionTable(name = "book_authors", joinColumns = @JoinColumn(name = "book_id"))
  @Column(name = "author")
  @JsonSerialize(as = ArrayList.class)
  @JsonDeserialize(as = ArrayList.class)
  private List<String> authors;

  @Column(length = 300)
  private String publisher;

  @Column(name = "published_at")
  private LocalDate publishedAt;

  @Lob
  @Basic(fetch = FetchType.LAZY)
  private String description;

  @Column(name = "cover_url", length = 1000)
  private String coverUrl;

  private Integer pageCount;

  private Float averageRating;

  private Integer ratingCount;

  private Integer readerCount;

  @Column(length = 10)
  private String language;

  @Column(nullable = false, length = 20)
  private String source;

  @JsonIgnore
  @ManyToMany(fetch = FetchType.LAZY)
  @JoinTable(
      name = "book_categories",
      joinColumns = @JoinColumn(name = "book_id"),
      inverseJoinColumns = @JoinColumn(name = "category_id"))
  private List<Category> categories;

  @Column(columnDefinition = "TEXT")
  private String searchText;

  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @PostLoad
  protected void onLoad() {
    if (authors != null) {
      this.authors = new ArrayList<>(authors);
    }
  }

  @PrePersist
  protected void onCreate() {
    this.createdAt = LocalDateTime.now();
    this.searchText = buildSearchText();
  }

  private String buildSearchText() {
    return String.join(
            " ",
            title != null ? title : "",
            authors != null ? String.join(" ", authors) : "",
            publisher != null ? publisher : "")
        .toLowerCase();
  }
}
