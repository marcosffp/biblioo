package com.biblioo.community.infrastructure.dto.mapper;

import com.biblioo.community.domain.model.CommunityMessage;
import com.biblioo.community.infrastructure.dto.MessageResponse;
import java.util.List;
import java.util.Set;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CommunityMessageMapper {

  MessageResponse toResponse(CommunityMessage message);

  List<MessageResponse> toResponseList(List<CommunityMessage> messages);

  // mantém comportamento de imutabilidade
  default Set<String> map(Set<String> tags) {
    return tags != null ? Set.copyOf(tags) : Set.of();
  }

  default List<String> map(List<String> images) {
    return images != null ? List.copyOf(images) : List.of();
  }
}
