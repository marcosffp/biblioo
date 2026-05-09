package com.biblioo.assistant.infrastructure.adapter;

import com.biblioo.assistant.domain.model.CommunityResult;
import com.biblioo.assistant.domain.port.out.AssistantCommunityPort;
import com.biblioo.community.domain.model.Community;
import com.biblioo.community.domain.model.CommunityType;
import com.biblioo.community.domain.port.in.CommunityUseCase;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
class CommunityPortAdapter implements AssistantCommunityPort {

  private final CommunityUseCase communityUseCase;

  @Override
  public List<CommunityResult> listUserCommunities(Long userId) {
    return communityUseCase.getUserCommunities(userId, PageRequest.of(0, 20)).stream()
        .map(this::toResult)
        .toList();
  }

  @Override
  public CommunityResult createCommunity(
      Long userId, String name, String description, String type, Long bookId) {
    CommunityType communityType;
    try {
      communityType = CommunityType.valueOf(type.toUpperCase());
    } catch (IllegalArgumentException e) {
      communityType = CommunityType.PUBLIC;
    }
    try {
      Community community = communityUseCase.createCommunity(userId, name, description, communityType, bookId);
      return toResult(community);
    } catch (Exception e) {
      log.warn("Falha ao criar comunidade: {}", e.getMessage());
      throw e;
    }
  }

  private CommunityResult toResult(Community c) {
    return new CommunityResult(c.getId(), c.getName(), c.getDescription(), c.getType().name(), c.getMemberCount());
  }
}
