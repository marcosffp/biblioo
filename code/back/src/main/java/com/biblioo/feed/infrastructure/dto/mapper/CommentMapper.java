package com.biblioo.feed.infrastructure.dto.mapper;

import com.biblioo.feed.domain.model.Comment;
import com.biblioo.feed.infrastructure.dto.comment.CommentBasicResponse;
import com.biblioo.feed.infrastructure.dto.comment.CommentResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CommentMapper {

  @Mapping(target = "likedByCurrentUser", constant = "false")
  @Mapping(target = "copyWithLikeStatus", ignore = true)
  CommentResponse toResponse(Comment comment);

  @Mapping(target = "authorUsername", ignore = true)
  @Mapping(target = "authorAvatarUrl", ignore = true)
  @Mapping(target = "deleted", source = "isDeleted")
  @Mapping(target = "likedByCurrentUser", constant = "false")
  CommentBasicResponse toBasicResponse(Comment comment);
}
