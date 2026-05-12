package com.biblioo.community.domain.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

import com.biblioo.community.domain.model.enumeration.InviteStatus;
import lombok.*;

@Entity
@Table(
    name = "community_invites",
    indexes = {
      @Index(name = "idx_ci_community", columnList = "community_id"),
      @Index(name = "idx_ci_invitee", columnList = "invitee_id"),
      @Index(name = "idx_ci_inviter", columnList = "inviter_id")
    })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommunityInvite {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "community_id", nullable = false)
  private Long communityId;

  @Column(name = "inviter_id", nullable = false)
  private Long inviterId;

  @Column(name = "invitee_id", nullable = false)
  private Long inviteeId;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 10)
  @Builder.Default
  private InviteStatus status = InviteStatus.PENDING;

  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @PrePersist
  protected void onCreate() {
    this.createdAt = LocalDateTime.now();
  }
}
