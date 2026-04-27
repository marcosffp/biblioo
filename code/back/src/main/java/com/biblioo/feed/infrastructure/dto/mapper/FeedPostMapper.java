package com.biblioo.feed.infrastructure.dto.mapper;

import com.biblioo.feed.domain.model.FeedPost;
import com.biblioo.feed.infrastructure.dto.post.FeedPostBasicResponse;
import com.biblioo.feed.infrastructure.dto.post.FeedPostResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface FeedPostMapper {

  FeedPostResponse toResponse(FeedPost post);

  FeedPostBasicResponse toBasicResponse(FeedPost post);
}
