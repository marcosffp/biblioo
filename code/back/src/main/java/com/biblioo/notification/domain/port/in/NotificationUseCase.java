package com.biblioo.notification.domain.port.in;

import com.biblioo.notification.domain.model.Notification;
import java.util.List;

public interface NotificationUseCase {

  List<Notification> getNotifications(Long userId, int page, int size);

  long countUnread(Long userId);

  void markAsRead(Long userId, String notificationId);

  void markAllAsRead(Long userId);
}
