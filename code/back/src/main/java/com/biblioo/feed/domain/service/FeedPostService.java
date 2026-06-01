package com.biblioo.feed.domain.service;

import com.biblioo.feed.domain.exception.FeedPostBusinessException;
import com.biblioo.feed.domain.model.FeedPost;
import com.biblioo.feed.domain.model.LikeType;
import com.biblioo.feed.domain.port.in.FeedPostUseCase;
import com.biblioo.feed.domain.port.out.FeedImagePort;
import com.biblioo.feed.domain.port.out.FeedPostFanoutPublisherPort;
import com.biblioo.feed.domain.port.out.UserPort;
import com.biblioo.feed.infrastructure.persistence.CommentRepository;
import com.biblioo.feed.infrastructure.persistence.FeedPostRepository;
import com.biblioo.feed.infrastructure.persistence.LikeRepository;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FeedPostService implements FeedPostUseCase {

  private final FeedPostRepository feedPostRepository;
  private final CommentRepository commentRepository;
  private final LikeRepository likeRepository;
  private final UserPort userPort;
  private final FeedImagePort feedImagePort;
  private final FeedPostFanoutPublisherPort fanoutPublisherPort;

  @Override
  @Transactional
  public FeedPost createPost(
      Long userId,
      Long bookId,
      String text,
      List<byte[]> images,
      byte[] gif,
      List<String> tags,
      boolean hasSpoiler) {

    if (!userPort.existsById(userId)) {
      throw new FeedPostBusinessException("Usuário não encontrado.");
    } 

    var post =
        FeedPost.builder()
            .userId(userId)
            .bookId(bookId)
            .text(text!=null && !text.trim().isEmpty() ? text : null)
            .tags(tags != null ? new ArrayList<>(tags) : new ArrayList<>())
            .hasSpoiler(hasSpoiler)
            .build();

    var saved = feedPostRepository.save(post);
    boolean needsUpdate = false;

    if (images != null && !images.isEmpty()) {
      saved.setImages(uploadImages(images, saved.getId().toString()));
      needsUpdate = true;
    }
    if (gif != null && gif.length > 0) {
      saved.setGifUrl(uploadGif(gif, saved.getId().toString()));
      needsUpdate = true;
    }
    if (needsUpdate) {
      saved = feedPostRepository.save(saved);
    }

    long epochMilli = saved.getCreatedAt().toInstant(ZoneOffset.UTC).toEpochMilli();
    fanoutPublisherPort.publishPostCreated(saved.getId(), userId, epochMilli);

    return saved;
  }

  @Override
  @Transactional
  public FeedPost updatePost(
      Long userId,
      Long postId,
      Long bookId,
      String text,
      List<byte[]> newImages,
      List<String> imagesToDeleteUrls,
      byte[] gif,
      List<String> tags,
      boolean hasSpoiler) {

    var post =
        feedPostRepository
            .findByIdAndIsDeletedFalse(postId)
            .orElseThrow(() -> new FeedPostBusinessException("Post não encontrado."));

    if (!post.getUserId().equals(userId)) {
      throw new FeedPostBusinessException("Sem permissão para editar este post.");
    }

    post.setBookId(bookId);
    post.setText(text!=null && !text.trim().isEmpty() ? text : null);
    post.setTags(tags != null ? new ArrayList<>(tags) : new ArrayList<>());
    post.setHasSpoiler(hasSpoiler);

    if (gif != null && gif.length > 0) {
      if (post.getGifUrl() != null && !post.getGifUrl().isBlank()) {
        deleteImagesAsync(List.of(post.getGifUrl()));
      }
      post.setGifUrl(uploadGif(gif, post.getId().toString()));
    }

    var currentImages =
        post.getImages() != null ? new ArrayList<>(post.getImages()) : new ArrayList<String>();

    if (imagesToDeleteUrls != null && !imagesToDeleteUrls.isEmpty()) {
      deleteImagesAsync(imagesToDeleteUrls);
      currentImages.removeAll(imagesToDeleteUrls);
    }
    if (newImages != null && !newImages.isEmpty()) {
      currentImages.addAll(uploadImages(newImages, post.getId().toString()));
    }

    post.setImages(currentImages);
    return feedPostRepository.save(post);
  }

  @Override
  @Transactional
  public void deletePost(Long userId, Long postId) {
    var post =
        feedPostRepository
            .findByIdAndIsDeletedFalse(postId)
            .orElseThrow(() -> new FeedPostBusinessException("Post não encontrado."));

    if (!post.getUserId().equals(userId)) {
      throw new FeedPostBusinessException("Sem permissão para excluir este post.");
    }

    var urlsToDelete = new ArrayList<String>();
    if (post.getImages() != null) urlsToDelete.addAll(post.getImages());
    if (post.getGifUrl() != null && !post.getGifUrl().isBlank()) urlsToDelete.add(post.getGifUrl());

    if (post.getCommentCount() != null && post.getCommentCount() > 0) {
      commentRepository.findByParentIdAndIsDeletedFalse(postId).forEach(c -> {
        if (c.getImages() != null) urlsToDelete.addAll(c.getImages());
        if (c.getGifUrl() != null && !c.getGifUrl().isBlank()) urlsToDelete.add(c.getGifUrl());
      });
      feedPostRepository.softDeletePost(postId, userId);
      commentRepository.softDeleteAllByParentId(postId);
    } else {
      commentRepository.deleteAllByParentId(postId);
      feedPostRepository.deleteById(postId);
    }

    if (!urlsToDelete.isEmpty()) deleteImagesAsync(urlsToDelete);
  }

  @Override
  @Transactional
  public boolean likePost(Long userId, Long postId) {
    var post =
        feedPostRepository
            .findByIdAndIsDeletedFalse(postId)
            .orElseThrow(() -> new FeedPostBusinessException("Post não encontrado."));

    if (post.getUserId().equals(userId)) {
      throw new FeedPostBusinessException("Você não pode curtir seu próprio post.");
    }

    // Race condition: dois threads tentando curtir/descurtir ao mesmo tempo.
    // likeRepository.existsByContentIdAndUserId + delete é verificação-depois-ação clássica.
    // O LikeSaveHelper resolve o lado do insert com REQUIRES_NEW + catch de DataIntegrityViolation.
    // O delete é atômico via query modifying — não precisa de proteção extra.
    if (likeRepository.existsByContentIdAndUserId(postId, userId)) {
      int deleted = likeRepository.deleteByContentIdAndUserId(postId, userId);
      if (deleted > 0) feedPostRepository.decrementLikeCount(postId);
      return false;
    }

    boolean inserted = likeRepository.insertIgnore(postId, userId, LikeType.LIKE.name()) > 0;
    if (inserted) feedPostRepository.incrementLikeCount(postId);
    return true;
  }

  @Override
  @Transactional(readOnly = true)
  public FeedPost getPostById(Long postId) {
    return feedPostRepository
        .findByIdAndIsDeletedFalse(postId)
        .orElseThrow(() -> new FeedPostBusinessException("Post não encontrado."));
  }

  @Override
  @Transactional(readOnly = true)
  public Page<FeedPost> getRecentPostsByUserId(Long userId, Pageable pageable) {
    if (!userPort.existsById(userId)) {
      throw new FeedPostBusinessException("Usuário não encontrado.");
    }
    return feedPostRepository.findRecentByUserId(userId, pageable);
  }

  private List<String> uploadImages(List<byte[]> images, String referenceId) {
    var futures = new ArrayList<CompletableFuture<String>>();
    for (var bytes : images) {
      futures.add(feedImagePort.uploadImage(bytes, referenceId, UUID.randomUUID().toString()));
    }
    return new ArrayList<>(futures.stream().map(CompletableFuture::join).toList());
  }

  private String uploadGif(byte[] gif, String referenceId) {
    return feedImagePort
        .uploadImage(gif, referenceId, UUID.randomUUID() + "_gif")
        .join();
  }

  private void deleteImagesAsync(List<String> urls) {
    var copy = new ArrayList<>(urls);
    CompletableFuture.runAsync(() -> feedImagePort.deleteImages(copy));
  }
}
