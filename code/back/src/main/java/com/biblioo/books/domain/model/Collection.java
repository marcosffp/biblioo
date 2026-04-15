package com.biblioo.books.domain.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.Hibernate;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(
    name = "shelf_collections",
    uniqueConstraints = {
      @UniqueConstraint(
          name = "uk_user_collection_name",
          columnNames = {"user_id", "name"})
    },
    indexes = {
      @Index(name = "idx_collection_user_id", columnList = "user_id"),
      @Index(name = "idx_collection_updated_at", columnList = "updated_at")
    })
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Collection {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "user_id", nullable = false)
  private Long userId;

  @Column(nullable = false, length = 100)
  private String name;

  @Column(length = 500)
  private String description;

  @ManyToMany(fetch = FetchType.LAZY)
  @JoinTable(
      name = "collection_shelves",
      joinColumns = @JoinColumn(name = "collection_id"),
      inverseJoinColumns = @JoinColumn(name = "shelf_id"))
  @Builder.Default
  private List<Shelf> shelves = new ArrayList<>();

  @CreationTimestamp
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @UpdateTimestamp
  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @PostLoad
  protected void onLoad() {
    if (shelves != null && Hibernate.isInitialized(shelves)) {
      this.shelves = new ArrayList<>(shelves);
    }
  }
}
