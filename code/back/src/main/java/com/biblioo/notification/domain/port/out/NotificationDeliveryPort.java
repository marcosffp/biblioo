package com.biblioo.notification.domain.port.out;

import com.biblioo.notification.domain.model.Notification;

public interface NotificationDeliveryPort {
  void deliver(Notification notification);
}
