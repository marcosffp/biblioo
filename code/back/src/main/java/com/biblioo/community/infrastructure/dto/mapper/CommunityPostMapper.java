package com.biblioo.community.infrastructure.dto.mapper;

import com.biblioo.community.domain.model.CommunityPost;
import com.biblioo.community.infrastructure.dto.CommunityPostResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CommunityPostMapper {
  CommunityPostResponse toResponse(CommunityPost post);
}
