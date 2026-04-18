package com.biblioo.community.domain.port.in;

import com.biblioo.community.domain.model.CommunityPost;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CommunityPostUseCase {

  CommunityPost createPost(
      Long userId,
      Long communityId,
      String text,
      List<byte[]> images,
      byte[] gif,
      List<String> tags,
      Boolean hasSpoiler,
      Integer pageRef);

  CommunityPost updatePost(
      Long userId,
      Long postId,
      String text,
      List<byte[]> newImages,
      List<String> imagesToDeleteUrls,
      byte[] gif,
      List<String> tags,
      Boolean hasSpoiler,
      Integer pageRef);

  void deletePost(Long actorId, Long postId);

  CommunityPost getPostById(Long postId);

  Page<CommunityPost> getCommunityFeed(Long communityId, Pageable pageable);

  boolean likePost(Long userId, Long postId);
}
