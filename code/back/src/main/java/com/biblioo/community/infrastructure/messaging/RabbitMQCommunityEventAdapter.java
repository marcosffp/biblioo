package com.biblioo.community.infrastructure.messaging;

import com.biblioo.community.domain.port.out.CommunityEventPublisherPort;
import com.biblioo.infrastructure.messaging.config.RabbitMQConfig;
import com.biblioo.infrastructure.messaging.service.OutboxEventService;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RabbitMQCommunityEventAdapter implements CommunityEventPublisherPort {

  private final OutboxEventService outboxEventService;

  @Override
  public void publishInviteSent(
      Long communityId,
      String communityName,
      Long inviterId,
      String inviterUsername,
      String inviterAvatarUrl,
      Long inviteeId) {
    Map<String, Object> payload = new HashMap<>();
    payload.put("recipientId", inviteeId);
    payload.put("communityId", communityId);
    payload.put("communityName", communityName);
    payload.put("inviterId", inviterId);
    payload.put("inviterUsername", inviterUsername);
    payload.put("inviterAvatarUrl", inviterAvatarUrl);

    outboxEventService.saveAndSchedulePublish(
        RabbitMQConfig.EVENT_COMMUNITY_INVITE,
        "COMMUNITY",
        communityId.toString(),
        RabbitMQConfig.NOTIFICATION_COMMUNITY_INVITE_ROUTING_KEY,
        payload);
  }

  @Override
  public void publishJoinRequestCreated(
      Long communityId,
      String communityName,
      Long requesterId,
      String requesterUsername,
      String requesterAvatarUrl,
      List<Long> recipientIds) {
    Map<String, Object> payload = new HashMap<>();
    payload.put("communityId", communityId);
    payload.put("communityName", communityName);
    payload.put("requesterId", requesterId);
    payload.put("requesterUsername", requesterUsername);
    payload.put("requesterAvatarUrl", requesterAvatarUrl);
    payload.put("recipientIds", recipientIds);

    outboxEventService.saveAndSchedulePublish(
        RabbitMQConfig.EVENT_COMMUNITY_JOIN_REQUEST,
        "COMMUNITY",
        communityId.toString(),
        RabbitMQConfig.NOTIFICATION_COMMUNITY_JOIN_REQUEST_ROUTING_KEY,
        payload);
  }

  @Override
  public void publishJoinRequestApproved(Long communityId, String communityName, Long userId) {
    Map<String, Object> payload = new HashMap<>();
    payload.put("recipientId", userId);
    payload.put("communityId", communityId);
    payload.put("communityName", communityName);

    outboxEventService.saveAndSchedulePublish(
        RabbitMQConfig.EVENT_COMMUNITY_JOIN_APPROVED,
        "COMMUNITY",
        communityId.toString(),
        RabbitMQConfig.NOTIFICATION_COMMUNITY_JOIN_APPROVED_ROUTING_KEY,
        payload);
  }

  @Override
  public void publishMemberJoinedForTrending(Long userId, Long bookId) {
    Map<String, Object> payload = new HashMap<>();
    payload.put("userId", userId);
    payload.put("bookId", bookId);

    outboxEventService.saveAndSchedulePublish(
        RabbitMQConfig.EVENT_COMMUNITY_JOIN_FOR_TRENDING,
        "COMMUNITY",
        bookId.toString(),
        RabbitMQConfig.TIC_JOIN_ROUTING_KEY,
        payload);
  }

  @Override
  public void publishMessagePostedForTrending(Long userId, Long bookId) {
    Map<String, Object> payload = new HashMap<>();
    payload.put("userId", userId);
    payload.put("bookId", bookId);

    outboxEventService.saveAndSchedulePublish(
        RabbitMQConfig.EVENT_COMMUNITY_MESSAGE_FOR_TRENDING,
        "COMMUNITY",
        bookId.toString(),
        RabbitMQConfig.TIC_MESSAGE_ROUTING_KEY,
        payload);
  }
}
