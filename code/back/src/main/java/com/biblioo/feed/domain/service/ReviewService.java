package com.biblioo.feed.domain.service;

import com.biblioo.feed.domain.exception.ReviewBusinessException;
import com.biblioo.feed.domain.model.Review;
import com.biblioo.feed.domain.port.in.ReviewUseCase;
import com.biblioo.feed.domain.port.out.BookPort;
import com.biblioo.feed.domain.port.out.FeedEventPublisherPort;
import com.biblioo.feed.domain.port.out.FeedImagePort;
import com.biblioo.feed.domain.port.out.ShelfInteractionPort;
import com.biblioo.feed.domain.port.out.UserPort;
import com.biblioo.feed.infrastructure.persistence.ReviewRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReviewService implements ReviewUseCase {

  private final ReviewRepository reviewRepository;
  private final BookPort bookPort;
  private final UserPort userPort;
  private final ShelfInteractionPort shelfInteractionPort;
  private final FeedImagePort feedImagePort;
  private final FeedEventPublisherPort feedEventPublisherPort;

  @Override
  @Transactional
  public Review createReview(
      Long userId, Long bookId, Integer rating, String text, List<byte[]> newImages, byte[] gif) {
    if (!userPort.existsById(userId)) {
      throw new ReviewBusinessException("Usuário não encontrado.");
    }

    if (reviewRepository.existsByUserIdAndBookIdAndIsDeletedFalse(userId, bookId)) {
      throw new ReviewBusinessException("O usuário já fez uma review para este livro.");
    }

    var book = bookPort.getBookById(bookId);
    if (book == null) {
      throw new ReviewBusinessException("Livro não encontrado.");
    }

    shelfInteractionPort.ensureBookReadStatusIsCompleted(userId, bookId);

    var review = Review.builder().userId(userId).book(book).rating(rating).text(text).build();

    var savedReview = reviewRepository.save(review);

    var needsUpdate = false;

    if (newImages != null && !newImages.isEmpty()) {
      var imageUrls = uploadImages(newImages, savedReview.getId().toString());
      savedReview.setImages(imageUrls);
      needsUpdate = true;
    }

    if (gif != null && gif.length > 0) {
      var uploadedGifUrl = uploadGif(gif, savedReview.getId().toString());
      savedReview.setGifUrl(uploadedGifUrl);
      needsUpdate = true;
    }

    if (needsUpdate) {
      savedReview = reviewRepository.save(savedReview);
    }

    feedEventPublisherPort.publishBookReviewStatsUpdated(bookId, null, rating);

    return savedReview;
  }

  @Override
  @Transactional
  public Review updateReview(
      Long userId,
      Long reviewId,
      Integer rating,
      String text,
      List<byte[]> newImages,
      List<String> imagesToDeleteUrls,
      byte[] gif) {
    var review =
        reviewRepository
            .findByIdAndIsDeletedFalse(reviewId)
            .orElseThrow(() -> new ReviewBusinessException("Review não encontrada."));

    if (!review.getUserId().equals(userId)) {
      throw new ReviewBusinessException("O usuário não tem permissão para editar esta review.");
    }

    var oldRating = review.getRating();

    review.setRating(rating);
    review.setText(text);

    if (gif != null && gif.length > 0) {
      if (review.getGifUrl() != null && !review.getGifUrl().isEmpty()) {
        deleteImagesAsync(List.of(review.getGifUrl()));
      }
      var uploadedGifUrl = uploadGif(gif, review.getId().toString());
      review.setGifUrl(uploadedGifUrl);
    }

    var currentImages =
        review.getImages() != null ? new ArrayList<>(review.getImages()) : new ArrayList<String>();

    if (imagesToDeleteUrls != null && !imagesToDeleteUrls.isEmpty()) {
      deleteImagesAsync(imagesToDeleteUrls);
      currentImages.removeAll(imagesToDeleteUrls);
    }

    if (newImages != null && !newImages.isEmpty()) {
      var uploadedUrls = uploadImages(newImages, review.getId().toString());
      currentImages.addAll(uploadedUrls);
    }

    review.setImages(currentImages);
    var savedReview = reviewRepository.save(review);

    feedEventPublisherPort.publishBookReviewStatsUpdated(
        review.getBook().getId(), oldRating, rating);

    return savedReview;
  }

  @Override
  @Transactional
  public void deleteReview(Long userId, Long reviewId) {
    var review =
        reviewRepository
            .findByIdAndIsDeletedFalse(reviewId)
            .orElseThrow(() -> new ReviewBusinessException("Review não encontrada."));

    if (!review.getUserId().equals(userId)) {
      throw new ReviewBusinessException("O usuário não tem permissão para excluir esta review.");
    }

    var oldRating = review.getRating();

    if (review.getImages() != null && !review.getImages().isEmpty()) {
      deleteImagesAsync(review.getImages());
    }

    if (review.getCommentCount() != null && review.getCommentCount() > 0) {
      reviewRepository.softDeleteReview(reviewId, userId);
    } else {
      reviewRepository.deleteById(reviewId);
    }

    feedEventPublisherPort.publishBookReviewStatsUpdated(review.getBook().getId(), oldRating, null);
  }

  @Override
  @Transactional
  public void likeReview(Long userId, Long reviewId) {
    var review =
        reviewRepository
            .findByIdAndIsDeletedFalse(reviewId)
            .orElseThrow(() -> new ReviewBusinessException("Review não encontrada."));

    // Regra de negócio: O próprio criador do conteúdo não pode dar like no próprio conteúdo
    if (review.getUserId().equals(userId)) {
      throw new ReviewBusinessException("Você não pode curtir sua própria review.");
    }

    // TODO: Futuramente chamar a Service/Repository de 'Like' aqui, verificar se já deu like,
    // e chamar reviewRepository.incrementLikeCount()
  }

  private List<String> uploadImages(List<byte[]> images, String referenceId) {
    var uploadFutures = new ArrayList<CompletableFuture<String>>();
    for (var imageBytes : images) {
      var imageId = UUID.randomUUID().toString();
      uploadFutures.add(feedImagePort.uploadImage(imageBytes, referenceId, imageId));
    }
    return new ArrayList<>(uploadFutures.stream().map(CompletableFuture::join).toList());
  }

  private String uploadGif(byte[] gif, String referenceId) {
    var gifId = UUID.randomUUID().toString() + "_gif";
    return feedImagePort.uploadImage(gif, referenceId, gifId).join();
  }

  private void deleteImagesAsync(List<String> imageUrls) {
    var urlsToDeleteList = new ArrayList<>(imageUrls);
    CompletableFuture.runAsync(() -> feedImagePort.deleteImages(urlsToDeleteList));
  }
}
