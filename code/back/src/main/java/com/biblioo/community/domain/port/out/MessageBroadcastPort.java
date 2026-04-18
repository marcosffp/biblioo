package com.biblioo.community.domain.port.out;

import com.biblioo.community.domain.model.CommunityMessage;

public interface MessageBroadcastPort {

  void broadcastNewMessage(CommunityMessage message);

  void broadcastEdit(CommunityMessage message);

  void broadcastDelete(Long communityId, Long messageId);

  void broadcastReaction(Long communityId, Long messageId, int newHeartCount);
}
