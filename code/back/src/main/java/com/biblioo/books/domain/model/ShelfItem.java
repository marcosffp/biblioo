package com.biblioo.books.domain.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(
    name = "shelf_items",
    uniqueConstraints = {
      @UniqueConstraint(
          name = "uk_shelf_book",
          columnNames = {"shelf_id", "book_id"})
    },
    indexes = {
      @Index(name = "idx_item_shelf_id", columnList = "shelf_id"),
      @Index(name = "idx_item_book_id", columnList = "book_id"),
      @Index(name = "idx_item_status", columnList = "status"),
      @Index(name = "idx_item_shelf_status", columnList = "shelf_id, status"),
      @Index(name = "idx_item_deleted_at", columnList = "deleted_at")
    })
@SQLRestriction("deleted_at IS NULL")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShelfItem {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "shelf_id", nullable = false)
  private Long shelfId;

  @Column(name = "book_id", nullable = false)
  private Long bookId;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private ReadingStatus status;

  @Column(name = "current_page")
  private Integer currentPage;

  @Column(name = "total_pages")
  private Integer totalPages;

  @Column(name = "progress_percent")
  private Integer progressPercent;

  @Column(name = "started_at")
  private LocalDate startedAt;

  @Column(name = "finished_at")
  private LocalDate finishedAt;

  @Column(name = "deleted_at")
  private LocalDateTime deletedAt;

  @CreationTimestamp
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @UpdateTimestamp
  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @PrePersist
  protected void onCreate() {
    if (this.currentPage == null) {
      this.currentPage = 0;
    }

    if ((this.status == ReadingStatus.READING || this.status == ReadingStatus.REREADING)
        && this.startedAt == null) {
      this.startedAt = LocalDate.now();
    }
  }

  @PreUpdate
  protected void onUpdate() {
    if ((this.status == ReadingStatus.READING || this.status == ReadingStatus.REREADING)
        && this.startedAt == null) {
      this.startedAt = LocalDate.now();
    }
  }
}
