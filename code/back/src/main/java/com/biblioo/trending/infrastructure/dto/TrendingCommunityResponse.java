package com.biblioo.trending.infrastructure.dto;

import com.biblioo.trending.domain.model.TrendingCommunityItem;

public record TrendingCommunityResponse(
    Long communityId,
    String name,
    String description,
    String type,
    Integer memberCount,
    Long recentMessages,
    Long newMembers,
    Long reactions,
    String reason,
    Double score) {

  public static TrendingCommunityResponse from(TrendingCommunityItem item) {
    return new TrendingCommunityResponse(
        item.communityId(),
        item.name(),
        item.description(),
        item.type(),
        item.memberCount(),
        item.recentMessages(),
        item.newMembers(),
        item.reactions(),
        item.reason(),
        item.score());
  }
}
