package com.biblioo.notification.infrastructure.delivery;

import com.biblioo.notification.domain.model.Notification;
import com.biblioo.notification.domain.port.out.NotificationDeliveryPort;
import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Slf4j
@Component
public class SseNotificationAdapter implements NotificationDeliveryPort {

  private final Map<Long, SseEmitter> emitters = new ConcurrentHashMap<>();

  public SseEmitter subscribe(Long userId) {
    SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
    emitters.put(userId, emitter);
    emitter.onCompletion(() -> emitters.remove(userId));
    emitter.onTimeout(() -> emitters.remove(userId));
    emitter.onError(e -> emitters.remove(userId));
    return emitter;
  }

  @Override
  public void deliver(Notification notification) {
    SseEmitter emitter = emitters.get(notification.getRecipientId());
    if (emitter == null) return;

    try {
      emitter.send(
          SseEmitter.event()
              .id(notification.getId())
              .name("notification")
              .data(toPayload(notification)));
    } catch (IOException e) {
      log.warn(
          "[SSE] Falha ao enviar notificação para userId={}: {}",
          notification.getRecipientId(),
          e.getMessage());
      emitters.remove(notification.getRecipientId());
    }
  }

  private Map<String, Object> toPayload(Notification notification) {
    return Map.of(
        "id", notification.getId(),
        "type", notification.getType().name(),
        "actorId", notification.getActorId(),
        "actorUsername", notification.getActorUsername(),
        "actorAvatarUrl", notification.getActorAvatarUrl() != null ? notification.getActorAvatarUrl() : "",
        "entityId", notification.getEntityId() != null ? notification.getEntityId() : "",
        "createdAt", notification.getCreatedAt().toString());
  }
}
