package com.biblioo.feed.domain.service;

import com.biblioo.feed.domain.exception.CommentBusinessException;
import com.biblioo.feed.domain.model.Comment;
import com.biblioo.feed.domain.port.in.CommentUseCase;
import com.biblioo.feed.domain.port.out.FeedImagePort;
import com.biblioo.feed.domain.port.out.UserPort;
import com.biblioo.feed.infrastructure.persistence.CommentRepository;
import com.biblioo.feed.infrastructure.persistence.ReviewRepository;
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
public class CommentService implements CommentUseCase {

  private final CommentRepository commentRepository;
  private final ReviewRepository reviewRepository;
  private final UserPort userPort;
  private final FeedImagePort feedImagePort;

  @Override
  @Transactional
  public Comment createComment(
      Long userId, Long parentId, String text, List<byte[]> images, byte[] gif) {

    if (!userPort.existsById(userId)) {
      throw new CommentBusinessException("Usuário não encontrado.");
    }

    if (text == null || text.isBlank()) {
      throw new CommentBusinessException("O texto do comentário não pode estar vazio.");
    }

    if (text.length() > 2000) {
      throw new CommentBusinessException("O texto do comentário não deve exceder 2000 caracteres.");
    }

    if (reviewRepository.findByIdAndIsDeletedFalse(parentId).isEmpty()) {
      throw new CommentBusinessException("Review pai não encontrada.");
    }

    var comment = Comment.builder().userId(userId).parentId(parentId).text(text).build();

    var savedComment = commentRepository.saveAndFlush(comment);

    var needsUpdate = false;

    if (images != null && !images.isEmpty()) {
      var imageUrls = uploadImages(images, savedComment.getId().toString());
      savedComment.setImages(imageUrls);
      needsUpdate = true;
    }

    if (gif != null && gif.length > 0) {
      var gifUrl = uploadGif(gif, savedComment.getId().toString());
      savedComment.setGifUrl(gifUrl);
      needsUpdate = true;
    }

    if (needsUpdate) {
      savedComment = commentRepository.save(savedComment);
    }

    reviewRepository.incrementCommentCount(parentId);

    return savedComment;
  }

  @Override
  @Transactional
  public Comment updateComment(
      Long userId,
      Long commentId,
      String text,
      List<byte[]> newImages,
      List<String> imagesToDeleteUrls,
      byte[] gif) {

    var comment =
        commentRepository
            .findByIdAndIsDeletedFalse(commentId)
            .orElseThrow(() -> new CommentBusinessException("Comentário não encontrado."));

    if (!comment.getUserId().equals(userId)) {
      throw new CommentBusinessException(
          "O usuário não tem permissão para editar este comentário.");
    }

    if (text == null || text.isBlank()) {
      throw new CommentBusinessException("O texto do comentário não pode estar vazio.");
    }

    if (text.length() > 2000) {
      throw new CommentBusinessException("O texto do comentário não deve exceder 2000 caracteres.");
    }

    comment.setText(text);

    if (gif != null && gif.length > 0) {
      if (comment.getGifUrl() != null && !comment.getGifUrl().isEmpty()) {
        deleteImagesAsync(List.of(comment.getGifUrl()));
      }
      var gifUrl = uploadGif(gif, comment.getId().toString());
      comment.setGifUrl(gifUrl);
    }

    var currentImages =
        comment.getImages() != null
            ? new ArrayList<>(comment.getImages())
            : new ArrayList<String>();

    if (imagesToDeleteUrls != null && !imagesToDeleteUrls.isEmpty()) {
      deleteImagesAsync(imagesToDeleteUrls);
      currentImages.removeAll(imagesToDeleteUrls);
    }

    if (newImages != null && !newImages.isEmpty()) {
      var uploadedUrls = uploadImages(newImages, comment.getId().toString());
      currentImages.addAll(uploadedUrls);
    }

    comment.setImages(currentImages);

    return commentRepository.save(comment);
  }

  @Override
  @Transactional
  public void deleteComment(Long userId, Long commentId) {
    var comment =
        commentRepository
            .findByIdAndIsDeletedFalse(commentId)
            .orElseThrow(
                () -> new CommentBusinessException("Comentário não encontrado ou já excluído."));

    if (!comment.getUserId().equals(userId)) {
      throw new CommentBusinessException(
          "O usuário não tem permissão para excluir este comentário.");
    }

    int rowsDeleted = commentRepository.softDeleteComment(commentId, userId);

    if (rowsDeleted > 0) {
      reviewRepository.decrementCommentCount(comment.getParentId());
      var urlsToDelete = new ArrayList<String>();
      if (comment.getImages() != null) urlsToDelete.addAll(comment.getImages());
      if (comment.getGifUrl() != null && !comment.getGifUrl().isEmpty()) {
        urlsToDelete.add(comment.getGifUrl());
      }
      if (!urlsToDelete.isEmpty()) {
        deleteImagesAsync(urlsToDelete);
      }
    }
  }

  @Override
  @Transactional(readOnly = true)
  public Comment getCommentById(Long commentId) {
    return commentRepository
        .findByIdAndIsDeletedFalse(commentId)
        .orElseThrow(() -> new CommentBusinessException("Comentário não encontrado."));
  }

  @Override
  @Transactional(readOnly = true)
  public Page<Comment> getComments(Long parentId, Pageable pageable) {
    return commentRepository.findByParentIdAndIsDeletedFalseOrderByCreatedAtDesc(
        parentId, pageable);
  }


  private List<String> uploadImages(List<byte[]> images, String referenceId) {
    var futures = new ArrayList<CompletableFuture<String>>();
    for (var bytes : images) {
      var imageId = UUID.randomUUID().toString();
      futures.add(feedImagePort.uploadImage(bytes, referenceId, imageId));
    }
    return new ArrayList<>(futures.stream().map(CompletableFuture::join).toList());
  }

  private String uploadGif(byte[] gif, String referenceId) {
    var gifId = UUID.randomUUID().toString() + "_gif";
    return feedImagePort.uploadImage(gif, referenceId, gifId).join();
  }

  private void deleteImagesAsync(List<String> urls) {
    var copy = new ArrayList<>(urls);
    CompletableFuture.runAsync(() -> feedImagePort.deleteImages(copy));
  }
}
