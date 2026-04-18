package com.biblioo.community.domain.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(
    name = "communities",
    indexes = {
      @Index(name = "idx_community_owner", columnList = "owner_id"),
      @Index(name = "idx_community_type", columnList = "type"),
      @Index(name = "idx_community_created_at", columnList = "created_at"),
      @Index(name = "idx_community_book", columnList = "book_id"),
      @Index(name = "idx_community_book_type", columnList = "book_id, type")
    })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Community {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 100)
  private String name;

  @Column(length = 500)
  private String description;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 10)
  private CommunityType type;

  @Column(name = "book_id", nullable = false)
  private Long bookId;

  @Column(name = "owner_id", nullable = false)
  private Long ownerId;

  @Column(name = "member_count", nullable = false)
  @Builder.Default
  private Integer memberCount = 1;

  @Column(name = "invite_link", unique = true, length = 36)
  private String inviteLink;

  @Column(name = "is_deleted", nullable = false)
  @Builder.Default
  private Boolean isDeleted = false;

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
