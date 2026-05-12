package com.biblioo.community.domain.port.out;

import com.biblioo.community.infrastructure.dto.voting.VotingEventPayload;

public interface VotingBroadcastPort {
  void broadcast(Long communityId, VotingEventPayload event);
}
