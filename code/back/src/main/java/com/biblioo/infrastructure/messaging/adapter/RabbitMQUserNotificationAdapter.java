package com.biblioo.infrastructure.messaging.adapter;

import com.biblioo.infrastructure.messaging.config.RabbitMQConfig;
import com.biblioo.infrastructure.messaging.service.OutboxEventService;
import com.biblioo.user.domain.port.out.UserNotificationEventPort;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RabbitMQUserNotificationAdapter implements UserNotificationEventPort {

  private final OutboxEventService outboxEventService;

  @Override
  public void publishFollowRequested(
      Long actorId, String actorUsername, String actorAvatarUrl, Long recipientId) {
    Map<String, Object> payload = new HashMap<>();
    payload.put("recipientId", recipientId);
    payload.put("actorId", actorId);
    payload.put("actorUsername", actorUsername);
    payload.put("actorAvatarUrl", actorAvatarUrl);

    outboxEventService.saveAndSchedulePublish(
        RabbitMQConfig.EVENT_USER_FOLLOW_REQUESTED,
        "USER",
        actorId.toString(),
        RabbitMQConfig.NOTIFICATION_FOLLOW_REQUESTED_ROUTING_KEY,
        payload);
  }

  @Override
  public void publishFollowed(
      Long actorId, String actorUsername, String actorAvatarUrl, Long recipientId) {
    Map<String, Object> payload = new HashMap<>();
    payload.put("recipientId", recipientId);
    payload.put("actorId", actorId);
    payload.put("actorUsername", actorUsername);
    payload.put("actorAvatarUrl", actorAvatarUrl);

    outboxEventService.saveAndSchedulePublish(
        RabbitMQConfig.EVENT_USER_FOLLOWED,
        "USER",
        actorId.toString(),
        RabbitMQConfig.NOTIFICATION_FOLLOWED_ROUTING_KEY,
        payload);
  }
}
