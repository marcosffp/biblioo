package com.biblioo.user.domain.port.out;

public interface UserNotificationEventPort {

  void publishFollowRequested(
      Long actorId, String actorUsername, String actorAvatarUrl, Long recipientId);

  void publishFollowed(
      Long actorId, String actorUsername, String actorAvatarUrl, Long recipientId);
}
