package com.biblioo.assistant.domain.port.out;

import com.biblioo.assistant.domain.model.CommunityResult;
import java.util.List;

public interface AssistantCommunityPort {

  List<CommunityResult> listUserCommunities(Long userId);

  CommunityResult createCommunity(
      Long userId, String name, String description, String type, Long bookId);
}
