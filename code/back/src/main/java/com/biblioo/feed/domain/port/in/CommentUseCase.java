package com.biblioo.feed.domain.port.in;

import com.biblioo.feed.domain.model.Comment;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CommentUseCase {

  Comment createComment(
      Long userId, Long parentId, String text, List<byte[]> images, byte[] gif);

  Comment updateComment(
      Long userId,
      Long commentId,
      String text,
      List<byte[]> newImages,
      List<String> imagesToDeleteUrls,
      byte[] gif);

  void deleteComment(Long userId, Long commentId);

  Comment getCommentById(Long commentId);

  Page<Comment> getComments(Long parentId, Pageable pageable);
}
