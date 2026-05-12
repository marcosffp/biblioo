package com.biblioo.community.domain.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

import com.biblioo.community.domain.model.enumeration.TieBreakRule;
import com.biblioo.community.domain.model.enumeration.VotingStatus;

import lombok.*;

@Entity
@Table(
    name = "community_votings",
    indexes = {
      @Index(name = "idx_cv_community", columnList = "community_id"),
      @Index(name = "idx_cv_status", columnList = "community_id, status"),
      @Index(name = "idx_cv_ends_at", columnList = "ends_at, status")
    })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookVoting {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "community_id", nullable = false)
  private Long communityId;

  @Column(nullable = false, length = 200)
  private String title;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private VotingStatus status;

  @Enumerated(EnumType.STRING)
  @Column(name = "tie_break_rule", nullable = false, length = 20)
  private TieBreakRule tieBreakRule;

  @Column(name = "starts_at", nullable = false)
  private LocalDateTime startsAt;

  @Column(name = "ends_at", nullable = false)
  private LocalDateTime endsAt;

  @Column(name = "closed_at")
  private LocalDateTime closedAt;

  @Column(name = "winner_option_id")
  private Long winnerOptionId;

  @Column(name = "rejection_reason", length = 500)
  private String rejectionReason;

  @Column(name = "created_by", nullable = false)
  private Long createdBy;

  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @PrePersist
  protected void onCreate() {
    this.createdAt = LocalDateTime.now();
    this.updatedAt = LocalDateTime.now();
  }

  @PreUpdate
  protected void onUpdate() {
    this.updatedAt = LocalDateTime.now();
  }
}
