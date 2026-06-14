package com.biblioo.community.domain.port.out;

import java.util.List;

public interface CommunityEventPublisherPort {
  void publishInviteSent(
      Long inviteId,
      Long communityId,
      String communityName,
      Long inviterId,
      String inviterUsername,
      String inviterAvatarUrl,
      Long inviteeId);

  void publishJoinRequestCreated(
      Long communityId,
      String communityName,
      Long requesterId,
      String requesterUsername,
      String requesterAvatarUrl,
      List<Long> recipientIds);

  void publishJoinRequestApproved(Long communityId, String communityName, Long userId);

  void publishMemberJoinedForTrending(Long userId, Long bookId);

  void publishMessagePostedForTrending(Long userId, Long bookId);
}
