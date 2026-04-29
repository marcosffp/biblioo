package com.biblioo.notification.domain.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
    name = "notifications",
    indexes = {
      @Index(name = "idx_notifications_recipient", columnList = "recipient_id"),
      @Index(name = "idx_notifications_recipient_read", columnList = "recipient_id, read_at"),
      @Index(name = "idx_notifications_created_at", columnList = "created_at")
    })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

  @Id
  @Column(length = 36)
  private String id;

  @Column(name = "recipient_id", nullable = false)
  private Long recipientId;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 30)
  private NotificationType type;

  @Column(name = "actor_id")
  private Long actorId;

  @Column(name = "actor_username", length = 30)
  private String actorUsername;

  @Column(name = "actor_avatar_url", length = 1000)
  private String actorAvatarUrl;

  /** ID da entidade relacionada (reviewId, commentId), nulo para eventos de follow. */
  @Column(name = "entity_id")
  private Long entityId;

  /** Contexto adicional para notificacoes de comunidade. */
  @Column(name = "community_id")
  private Long communityId;

  @Column(name = "read_at")
  private LocalDateTime readAt;

  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @PrePersist
  void onCreate() {
    this.createdAt = LocalDateTime.now();
  }

  public boolean isRead() {
    return readAt != null;
  }
}
