package com.biblioo.feed.infrastructure.dto.mapper;

import com.biblioo.feed.domain.model.Comment;
import com.biblioo.feed.infrastructure.dto.comment.CommentBasicResponse;
import com.biblioo.feed.infrastructure.dto.comment.CommentResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CommentMapper {

  CommentResponse toResponse(Comment comment);

  @Mapping(target = "authorUsername", ignore = true)
  @Mapping(target = "authorAvatarUrl", ignore = true)
  @Mapping(target = "deleted", source = "isDeleted")
  CommentBasicResponse toBasicResponse(Comment comment);
}
