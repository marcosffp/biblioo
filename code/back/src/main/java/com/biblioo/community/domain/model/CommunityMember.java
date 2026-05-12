package com.biblioo.community.domain.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

import com.biblioo.community.domain.model.enumeration.CommunityRole;

import lombok.*;

@Entity
@Table(
    name = "community_members",
    indexes = {
      @Index(name = "idx_cm_community", columnList = "community_id"),
      @Index(name = "idx_cm_user", columnList = "user_id"),
      @Index(name = "idx_cm_role", columnList = "community_id, role")
    })
@IdClass(CommunityMemberId.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommunityMember {

  @Id
  @Column(name = "community_id")
  private Long communityId;

  @Id
  @Column(name = "user_id")
  private Long userId;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 15)
  private CommunityRole role;

  @Column(name = "joined_at", nullable = false, updatable = false)
  private LocalDateTime joinedAt;

  @PrePersist
  protected void onCreate() {
    this.joinedAt = LocalDateTime.now();
  }
}
