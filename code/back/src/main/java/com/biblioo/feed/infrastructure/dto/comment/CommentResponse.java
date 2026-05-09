package com.biblioo.feed.infrastructure.dto.comment;

import java.time.LocalDateTime;
import java.util.List;

public record CommentResponse(
    Long id,
    Long userId,
    Long parentId,
    String text,
    List<String> images,
    String gifUrl,
    List<String> tags,
    Boolean hasSpoiler,
    Integer likeCount,
    LocalDateTime createdAt,
    boolean likedByCurrentUser) {

  public CommentResponse copyWithLikeStatus(boolean liked) {
    return new CommentResponse(
        id, userId, parentId, text, images, gifUrl, tags, hasSpoiler, likeCount, createdAt, liked);
  }
}
