package com.biblioo.recommendation.domain.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(
    name = "user_preferences",
    indexes = {
      @Index(name = "idx_user_preferences_user_id", columnList = "user_id", unique = true)
    })
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPreference {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "user_id", nullable = false, unique = true)
  private Long userId;

  @ElementCollection(fetch = FetchType.EAGER)
  @CollectionTable(
      name = "user_preference_genres",
      joinColumns = @JoinColumn(name = "preference_id"))
  @Column(name = "genre", length = 100)
  @Builder.Default
  private List<String> genres = new ArrayList<>();

  @ElementCollection(fetch = FetchType.EAGER)
  @CollectionTable(
      name = "user_preference_books",
      joinColumns = @JoinColumn(name = "preference_id"))
  @Column(name = "book_id")
  @Builder.Default
  private List<Long> bookIds = new ArrayList<>();

  @CreationTimestamp
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @UpdateTimestamp
  @Column(name = "updated_at")
  private LocalDateTime updatedAt;
}
