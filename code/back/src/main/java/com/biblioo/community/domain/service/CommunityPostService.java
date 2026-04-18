package com.biblioo.community.domain.service;

import com.biblioo.community.domain.exception.CommunityAccessDeniedException;
import com.biblioo.community.domain.exception.CommunityBusinessException;
import com.biblioo.community.domain.model.CommunityPost;
import com.biblioo.community.domain.model.CommunityRole;
import com.biblioo.community.domain.port.in.CommunityPostUseCase;
import com.biblioo.community.infrastructure.persistence.CommunityMemberRepository;
import com.biblioo.community.infrastructure.persistence.CommunityPostRepository;
import com.biblioo.community.infrastructure.persistence.CommunityRepository;
import com.biblioo.feed.domain.model.Like;
import com.biblioo.feed.domain.model.LikeType;
import com.biblioo.feed.domain.port.out.FeedImagePort;
import com.biblioo.feed.infrastructure.persistence.CommentRepository;
import com.biblioo.feed.infrastructure.persistence.LikeRepository;
import com.biblioo.feed.infrastructure.persistence.LikeSaveHelper;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
public class CommunityPostService implements CommunityPostUseCase {

  private final CommunityPostRepository postRepository;
  private final CommunityRepository communityRepository;
  private final CommunityMemberRepository memberRepository;
  private final LikeRepository likeRepository;
  private final LikeSaveHelper likeSaveHelper;
  private final CommentRepository commentRepository;
  private final FeedImagePort feedImagePort;

  @Override
  @Transactional
  public CommunityPost createPost(
      Long userId,
      Long communityId,
      String text,
      List<byte[]> images,
      byte[] gif,
      List<String> tags,
      Boolean hasSpoiler,
      Integer pageRef) {

    communityRepository
        .findActiveById(communityId)
        .orElseThrow(() -> new CommunityBusinessException("Comunidade não encontrada."));

    if (!memberRepository.isMember(communityId, userId)) {
      throw new CommunityAccessDeniedException("Apenas membros podem postar na comunidade.");
    }

    CommunityPost post =
        CommunityPost.builder()
            .communityId(communityId)
            .userId(userId)
            .text(text)
            .hasSpoiler(hasSpoiler != null ? hasSpoiler : false)
            .pageRef(pageRef)
            .build();

    if (tags != null && !tags.isEmpty()) {
      post.setTags(new ArrayList<>(tags));
    }

    post = postRepository.save(post);

    boolean needsUpdate = false;

    if (images != null && !images.isEmpty()) {
      List<String> imageUrls = uploadImages(images, post.getId().toString());
      post.setImages(imageUrls);
      needsUpdate = true;
    }

    if (gif != null && gif.length > 0) {
      String gifUrl = uploadGif(gif, post.getId().toString());
      post.setGifUrl(gifUrl);
      needsUpdate = true;
    }

    if (needsUpdate) {
      post = postRepository.save(post);
    }

    return post;
  }

  @Override
  @Transactional
  public CommunityPost updatePost(
      Long userId,
      Long postId,
      String text,
      List<byte[]> newImages,
      List<String> imagesToDeleteUrls,
      byte[] gif,
      List<String> tags,
      Boolean hasSpoiler,
      Integer pageRef) {

    CommunityPost post = getActivePost(postId);

    if (!post.getUserId().equals(userId)) {
      throw new CommunityAccessDeniedException("Apenas o autor pode editar este post.");
    }

    if (text != null) {
      post.setText(text);
    }
    if (hasSpoiler != null) {
      post.setHasSpoiler(hasSpoiler);
    }
    if (pageRef != null) {
      post.setPageRef(pageRef);
    }
    if (tags != null) {
      post.setTags(new ArrayList<>(tags));
    }

    if (gif != null && gif.length > 0) {
      if (post.getGifUrl() != null && !post.getGifUrl().isEmpty()) {
        feedImagePort.deleteImages(List.of(post.getGifUrl()));
      }
      String gifUrl = uploadGif(gif, post.getId().toString());
      post.setGifUrl(gifUrl);
    }

    List<String> currentImages =
        post.getImages() != null ? new ArrayList<>(post.getImages()) : new ArrayList<>();

    if (imagesToDeleteUrls != null && !imagesToDeleteUrls.isEmpty()) {
      currentImages.removeAll(imagesToDeleteUrls);
      feedImagePort.deleteImages(imagesToDeleteUrls);
    }

    if (newImages != null && !newImages.isEmpty()) {
      List<String> uploaded = uploadImages(newImages, post.getId().toString());
      currentImages.addAll(uploaded);
    }

    post.setImages(currentImages);
    return postRepository.save(post);
  }

  @Override
  @Transactional
  public void deletePost(Long actorId, Long postId) {
    CommunityPost post = getActivePost(postId);

    boolean isAuthor = post.getUserId().equals(actorId);
    if (!isAuthor) {
      CommunityRole actorRole =
          memberRepository
              .findRole(post.getCommunityId(), actorId)
              .orElseThrow(
                  () ->
                      new CommunityAccessDeniedException(
                          "Você não tem permissão para excluir este post."));

      if (actorRole == CommunityRole.MEMBER) {
        throw new CommunityAccessDeniedException(
            "Apenas o autor, moderadores ou proprietário podem excluir posts.");
      }
    }

    if (post.getImages() != null && !post.getImages().isEmpty()) {
      feedImagePort.deleteImages(post.getImages());
    }

    if (post.getCommentCount() != null && post.getCommentCount() > 0) {
      postRepository.softDelete(postId);
      commentRepository.softDeleteAllByParentId(postId);
    } else {
      commentRepository.deleteAllByParentId(postId);
      postRepository.deleteById(postId);
    }
  }

  @Override
  @Transactional(readOnly = true)
  public CommunityPost getPostById(Long postId) {
    return getActivePost(postId);
  }

  @Override
  @Transactional(readOnly = true)
  public Page<CommunityPost> getCommunityFeed(Long communityId, Pageable pageable) {
    communityRepository
        .findActiveById(communityId)
        .orElseThrow(() -> new CommunityBusinessException("Comunidade não encontrada."));
    return postRepository.findByCommunityId(communityId, pageable);
  }

  @Override
  @Transactional
  public boolean likePost(Long userId, Long postId) {
    CommunityPost post = getActivePost(postId);

    if (post.getUserId().equals(userId)) {
      throw new CommunityBusinessException("Você não pode curtir seu próprio post.");
    }

    if (!memberRepository.isMember(post.getCommunityId(), userId)) {
      throw new CommunityAccessDeniedException("Apenas membros podem curtir posts da comunidade.");
    }

    if (likeRepository.existsByContentIdAndUserId(postId, userId)) {
      int rowsDeleted = likeRepository.deleteByContentIdAndUserId(postId, userId);
      if (rowsDeleted > 0) {
        postRepository.decrementLikeCount(postId);
      }
      return false;
    }

    Like like = Like.builder().contentId(postId).userId(userId).type(LikeType.LIKE).build();
    boolean inserted = likeSaveHelper.tryInsert(like);
    if (inserted) {
      postRepository.incrementLikeCount(postId);
    }
    return true;
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private CommunityPost getActivePost(Long postId) {
    return postRepository
        .findActiveById(postId)
        .orElseThrow(() -> new CommunityBusinessException("Post não encontrado."));
  }

  private List<String> uploadImages(List<byte[]> images, String referenceId) {
    List<CompletableFuture<String>> futures = new ArrayList<>();
    for (byte[] imageBytes : images) {
      String imageId = UUID.randomUUID().toString();
      futures.add(feedImagePort.uploadImage(imageBytes, referenceId, imageId));
    }
    return new ArrayList<>(futures.stream().map(CompletableFuture::join).toList());
  }

  private String uploadGif(byte[] gif, String referenceId) {
    String gifId = UUID.randomUUID().toString() + "_gif";
    return feedImagePort.uploadImage(gif, referenceId, gifId).join();
  }
}
