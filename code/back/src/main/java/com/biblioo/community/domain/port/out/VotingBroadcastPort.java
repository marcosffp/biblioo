package com.biblioo.community.domain.port.out;

import com.biblioo.community.infrastructure.dto.VotingEventPayload;

public interface VotingBroadcastPort {
  void broadcast(Long communityId, VotingEventPayload event);
}
