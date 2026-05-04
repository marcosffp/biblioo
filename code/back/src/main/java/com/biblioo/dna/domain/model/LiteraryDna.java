package com.biblioo.dna.domain.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(
    name = "literary_dna",
    indexes = {
      @Index(name = "idx_dna_user_id", columnList = "user_id", unique = true)
    })
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LiteraryDna {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "user_id", nullable = false, unique = true)
  private Long userId;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private DnaStatus status;

  @Column(name = "books_read_count")
  @Builder.Default
  private Integer booksReadCount = 0;

  @Column(name = "complexity_score")
  private Double complexityScore;

  @Column(name = "complexity_label", length = 50)
  private String complexityLabel;

  @Column(name = "avg_days_per_book")
  private Double avgDaysPerBook;

  @Column(name = "reread_rate")
  private Double rereadRate;

  @Column(name = "reread_count")
  private Integer rereadCount;

  @Column(name = "abandoned_count")
  @Builder.Default
  private Integer abandonedCount = 0;

  @Lob
  @Column(name = "central_themes_json")
  private String centralThemesJson;

  @Enumerated(EnumType.STRING)
  @Column(name = "dominant_archetype", length = 30)
  private LiteraryArchetype dominantArchetype;

  @Lob
  @Column(name = "secondary_archetypes_json")
  private String secondaryArchetypesJson;

  @Column(name = "most_abandoned_genre", length = 200)
  private String mostAbandonedGenre;

  @Column(name = "avg_time_per_book_days")
  private Double avgTimePerBookDays;

  @Enumerated(EnumType.STRING)
  @Column(name = "pending_archetype", length = 30)
  private LiteraryArchetype pendingArchetype;

  @Column(name = "pending_archetype_months_count")
  @Builder.Default
  private Integer pendingArchetypeMonthsCount = 0;

  @Column(name = "calculated_at")
  private LocalDateTime calculatedAt;

  @Column
private Integer totalPagesRead;

@Column(columnDefinition = "TEXT")
private String pagesByYearJson;

  @CreationTimestamp
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @UpdateTimestamp
  @Column(name = "updated_at")
  private LocalDateTime updatedAt;
}
