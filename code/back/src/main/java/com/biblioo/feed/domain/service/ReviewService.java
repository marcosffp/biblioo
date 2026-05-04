package com.biblioo.feed.domain.service;

import com.biblioo.feed.domain.exception.ReviewBusinessException;
import com.biblioo.feed.domain.model.LikeType;
import com.biblioo.feed.domain.model.Review;
import com.biblioo.feed.domain.port.in.ReviewUseCase;
import com.biblioo.feed.domain.port.out.BookPort;
import com.biblioo.feed.domain.port.out.FeedEventPublisherPort;
import com.biblioo.feed.domain.port.out.ReviewFanoutPublisherPort;
import com.biblioo.feed.domain.port.out.ShelfInteractionPort;
import com.biblioo.feed.domain.port.out.UserPort;
import com.biblioo.feed.infrastructure.persistence.CommentRepository;
import com.biblioo.feed.infrastructure.persistence.LikeRepository;
import com.biblioo.feed.infrastructure.persistence.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReviewService implements ReviewUseCase {

  private final ReviewRepository reviewRepository;
  private final CommentRepository commentRepository;
  private final LikeRepository likeRepository;
  private final BookPort bookPort;
  private final UserPort userPort;
  private final ShelfInteractionPort shelfInteractionPort;
  private final FeedEventPublisherPort feedEventPublisherPort;
  private final ReviewFanoutPublisherPort reviewFanoutPublisherPort;

  @Override
  @Transactional
  public Review createReview(Long userId, Long bookId, Integer rating, String text) {
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

    if (!shelfInteractionPort.containsBook(userId, bookId)) {
      throw new ReviewBusinessException("O livro precisa estar na estante para ser avaliado.");
    }

    var review =
        Review.builder()
            .userId(userId)
            .bookId(bookId)
            .rating(rating)
            .text(text)
            .isPublished(true)
            .isPublished(publish)
            .hasSpoiler(hasSpoiler)
            .build();

    var savedReview = reviewRepository.save(review);

    feedEventPublisherPort.publishBookReviewStatsUpdated(bookId, null, rating);

    long createdAtEpochMilli =
        savedReview.getCreatedAt().toInstant(java.time.ZoneOffset.UTC).toEpochMilli();
    reviewFanoutPublisherPort.publishReviewCreated(savedReview.getId(), userId, createdAtEpochMilli);

    return savedReview;
  }

  @Override
  @Transactional
  public Review updateReview(Long userId, Long reviewId, Integer rating, String text) {
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
    review.setHasSpoiler(hasSpoiler);

    var savedReview = reviewRepository.save(review);

    feedEventPublisherPort.publishBookReviewStatsUpdated(review.getBookId(), oldRating, rating);

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

    if (review.getCommentCount() != null && review.getCommentCount() > 0) {
      reviewRepository.softDeleteReview(reviewId, userId);
      commentRepository.softDeleteAllByParentId(reviewId);
    } else {
      commentRepository.deleteAllByParentId(reviewId);
      reviewRepository.deleteById(reviewId);
    }

    feedEventPublisherPort.publishBookReviewStatsUpdated(review.getBookId(), oldRating, null);
  }

  @Override
  @Transactional
  public boolean likeReview(Long userId, Long reviewId) {
    var review =
        reviewRepository
            .findByIdAndIsDeletedFalse(reviewId)
            .orElseThrow(() -> new ReviewBusinessException("Review não encontrada."));

    if (review.getUserId().equals(userId)) {
      throw new ReviewBusinessException("Você não pode curtir sua própria review.");
    }

    if (likeRepository.existsByContentIdAndUserId(reviewId, userId)) {
      int rowsDeleted = likeRepository.deleteByContentIdAndUserId(reviewId, userId);
      if (rowsDeleted > 0) {
        reviewRepository.decrementLikeCount(reviewId);
      }
      return false;
    }

    boolean inserted = likeRepository.insertIgnore(reviewId, userId, LikeType.LIKE.name()) > 0;
    if (inserted) {
      reviewRepository.incrementLikeCount(reviewId);
    }
    return true;
  }

  @Override
  @Transactional(readOnly = true)
  public Review getReviewById(Long reviewId) {
    return reviewRepository
        .findByIdAndIsDeletedFalse(reviewId)
        .orElseThrow(() -> new ReviewBusinessException("Review não encontrada."));
  }

  @Override
  @Transactional(readOnly = true)
  public Page<Review> getRecentReviewsByUserId(Long userId, Pageable pageable) {
    if (!userPort.existsById(userId)) {
      throw new ReviewBusinessException("Usuário não encontrado.");
    }
    return reviewRepository.findRecentReviewsByUserId(userId, pageable);
  }
}
