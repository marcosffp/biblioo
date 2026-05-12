package com.biblioo.community.domain.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

import com.biblioo.community.domain.model.enumeration.JoinRequestStatus;
import lombok.*;

@Entity
@Table(
    name = "community_join_requests",
    indexes = {
      @Index(name = "idx_cjr_community", columnList = "community_id"),
      @Index(name = "idx_cjr_user", columnList = "user_id"),
      @Index(name = "idx_cjr_status", columnList = "community_id, status")
    })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommunityJoinRequest {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "community_id", nullable = false)
  private Long communityId;

  @Column(name = "user_id", nullable = false)
  private Long userId;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 10)
  @Builder.Default
  private JoinRequestStatus status = JoinRequestStatus.PENDING;

  @Column(name = "reviewed_by")
  private Long reviewedBy;

  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Column(name = "reviewed_at")
  private LocalDateTime reviewedAt;

  @PrePersist
  protected void onCreate() {
    this.createdAt = LocalDateTime.now();
  }
}
