package com.biblioo.trending.domain.model;

import java.util.ArrayList;
import java.util.List;

public record TrendingCommunityItem(
    Long communityId,
    String name,
    String description,
    String type,
    Integer memberCount,
    Long recentMessages,
    Long newMembers,
    Long reactions,
    Double score) {

  public String reason() {
    List<String> parts = new ArrayList<>();
    if (recentMessages != null && recentMessages > 0)
      parts.add("+" + recentMessages + (recentMessages == 1 ? " mensagem" : " mensagens"));
    if (newMembers != null && newMembers > 0)
      parts.add("+" + newMembers + (newMembers == 1 ? " membro" : " membros"));
    if (reactions != null && reactions > 0)
      parts.add("+" + reactions + (reactions == 1 ? " reação" : " reações"));
    return parts.isEmpty() ? "Em tendência" : String.join(" • ", parts) + " nas últimas 48h";
  }
}
