package com.biblioo.feed.domain.port.in;

import com.biblioo.feed.domain.model.FeedPost;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface FeedPostUseCase {

  FeedPost createPost(
      Long userId,
      String text,
      List<byte[]> images,
      byte[] gif,
      List<String> tags,
      boolean hasSpoiler);

  FeedPost updatePost(
      Long userId,
      Long postId,
      String text,
      List<byte[]> newImages,
      List<String> imagesToDeleteUrls,
      byte[] gif,
      List<String> tags,
      boolean hasSpoiler);

  void deletePost(Long userId, Long postId);

  boolean likePost(Long userId, Long postId);

  FeedPost getPostById(Long postId);

  Page<FeedPost> getRecentPostsByUserId(Long userId, Pageable pageable);
}
