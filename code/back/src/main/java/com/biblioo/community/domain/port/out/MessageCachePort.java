package com.biblioo.community.domain.port.out;

import com.biblioo.community.domain.model.CommunityMessage;
import java.util.List;

public interface MessageCachePort {

  void pushMessage(Long communityId, CommunityMessage message);

  List<CommunityMessage> getRecentMessages(Long communityId);

  void invalidate(Long communityId);
}
