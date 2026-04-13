package com.biblioo.notification.infrastructure.dto;

import com.biblioo.notification.domain.model.Notification;
import java.time.LocalDateTime;

public record NotificationResponse(
    String id,
    String type,
    Long actorId,
    String actorUsername,
    String actorAvatarUrl,
    Long entityId,
    boolean read,
    LocalDateTime createdAt) {

  public static NotificationResponse from(Notification n) {
    return new NotificationResponse(
        n.getId(),
        n.getType().name(),
        n.getActorId(),
        n.getActorUsername(),
        n.getActorAvatarUrl(),
        n.getEntityId(),
        n.isRead(),
        n.getCreatedAt());
  }
}
