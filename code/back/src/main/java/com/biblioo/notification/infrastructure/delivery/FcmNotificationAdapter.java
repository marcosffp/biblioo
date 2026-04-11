package com.biblioo.notification.infrastructure.delivery;

import com.biblioo.notification.domain.model.Notification;
import com.biblioo.notification.domain.port.out.NotificationDeliveryPort;
import com.biblioo.notification.infrastructure.persistence.DeviceTokenRepository;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class FcmNotificationAdapter implements NotificationDeliveryPort {

  private final DeviceTokenRepository deviceTokenRepo;

  @Override
  public void deliver(Notification notification) {
    List<String> tokens = deviceTokenRepo.findTokensByUserId(notification.getRecipientId());
    if (tokens.isEmpty()) return;

    String title = buildTitle(notification);

    tokens.forEach(token -> sendToToken(token, title, notification));
  }

  private void sendToToken(String token, String title, Notification notification) {
    try {
      Message message =
          Message.builder()
              .setToken(token)
              .setNotification(
                  com.google.firebase.messaging.Notification.builder()
                      .setTitle(title)
                      .build())
              .putData("notificationId", notification.getId())
              .putData("type", notification.getType().name())
              .putData("actorId", notification.getActorId().toString())
              .putData("actorUsername", notification.getActorUsername())
              .putData(
                  "actorAvatarUrl",
                  notification.getActorAvatarUrl() != null ? notification.getActorAvatarUrl() : "")
              .putData(
                  "entityId",
                  notification.getEntityId() != null
                      ? notification.getEntityId().toString()
                      : "")
              .build();

      FirebaseMessaging.getInstance().send(message);
      log.info(
          "[FCM] Notificação enviada para token={} type={}",
          token.substring(0, 10) + "...",
          notification.getType());

    } catch (Exception e) {
      log.warn("[FCM] Falha ao enviar para token: {}", e.getMessage());
    }
  }

  private String buildTitle(Notification notification) {
    return switch (notification.getType()) {
      case USER_FOLLOW_REQUESTED ->
          notification.getActorUsername() + " quer te seguir";
      case USER_FOLLOWED ->
          notification.getActorUsername() + " começou a te seguir";
      case COMMENT_REPLIED ->
          notification.getActorUsername() + " respondeu seu comentário";
      case REVIEW_LIKED ->
          notification.getActorUsername() + " curtiu sua resenha";
    };
  }
}
