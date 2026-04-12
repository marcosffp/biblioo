package com.biblioo.feed.infrastructure.dto.mapper;

import com.biblioo.feed.domain.model.Comment;
import com.biblioo.feed.infrastructure.dto.comment.CommentBasicResponse;
import com.biblioo.feed.infrastructure.dto.comment.CommentResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CommentMapper {

  CommentResponse toResponse(Comment comment);

  CommentBasicResponse toBasicResponse(Comment comment);
}
