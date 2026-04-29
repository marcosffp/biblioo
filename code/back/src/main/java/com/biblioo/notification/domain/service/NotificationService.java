package com.biblioo.notification.domain.service;

import com.biblioo.notification.domain.model.Notification;
import com.biblioo.notification.domain.model.NotificationType;
import com.biblioo.notification.domain.port.in.NotificationUseCase;
import com.biblioo.notification.domain.port.out.NotificationDeliveryPort;
import com.biblioo.notification.infrastructure.persistence.NotificationRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationService implements NotificationUseCase {

  private final NotificationRepository notificationRepo;
  private final List<NotificationDeliveryPort> deliveryPorts;

  @Transactional
  public void createAndDeliver(
      NotificationType type,
      Long recipientId,
      Long actorId,
      String actorUsername,
      String actorAvatarUrl,
      Long entityId) {
    createAndDeliverInternal(
        type, recipientId, actorId, actorUsername, actorAvatarUrl, entityId, null);
    }

    @Transactional
    public void createAndDeliver(
      NotificationType type,
      Long recipientId,
      Long actorId,
      String actorUsername,
      String actorAvatarUrl,
      Long entityId,
      Long communityId) {
      createAndDeliverInternal(
        type, recipientId, actorId, actorUsername, actorAvatarUrl, entityId, communityId);
      }

      private void createAndDeliverInternal(
        NotificationType type,
        Long recipientId,
        Long actorId,
        String actorUsername,
        String actorAvatarUrl,
        Long entityId,
        Long communityId) {

    Notification notification =
        Notification.builder()
            .id(UUID.randomUUID().toString())
            .recipientId(recipientId)
            .type(type)
            .actorId(actorId)
            .actorUsername(actorUsername)
            .actorAvatarUrl(actorAvatarUrl)
            .entityId(entityId)
            .communityId(communityId)
            .build();

    Notification saved = notificationRepo.save(notification);
    deliveryPorts.forEach(port -> port.deliver(saved));
  }

  @Override
  public List<Notification> getNotifications(Long userId, int page, int size) {
    return notificationRepo.findByRecipientId(userId, PageRequest.of(page, size));
  }

  @Override
  public long countUnread(Long userId) {
    return notificationRepo.countUnreadByRecipientId(userId);
  }

  @Override
  @Transactional
  public void markAsRead(Long userId, String notificationId) {
    notificationRepo.markAsRead(notificationId, userId, LocalDateTime.now());
  }

  @Override
  @Transactional
  public void markAllAsRead(Long userId) {
    notificationRepo.markAllAsRead(userId, LocalDateTime.now());
  }
}
