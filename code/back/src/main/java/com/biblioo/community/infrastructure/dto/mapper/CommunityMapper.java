package com.biblioo.community.infrastructure.dto.mapper;

import com.biblioo.community.domain.model.Community;
import com.biblioo.community.domain.model.enumeration.CommunityRole;
import com.biblioo.community.infrastructure.dto.community.CommunityDetailResponse;
import com.biblioo.community.infrastructure.dto.community.CommunityResponse;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CommunityMapper {
  CommunityResponse toResponse(Community community);

  @Mapping(target = "currentUserRole", source = "currentUserRole")
  CommunityDetailResponse toDetailResponse(Community community, CommunityRole currentUserRole);
}
