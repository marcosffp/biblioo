package com.biblioo.feed.infrastructure.web;

import com.biblioo.feed.domain.exception.ReviewBusinessException;
import com.biblioo.feed.domain.model.Review;
import com.biblioo.feed.domain.port.in.ReviewUseCase;
import com.biblioo.feed.domain.service.LikeStatusResolver;
import com.biblioo.feed.infrastructure.dto.like.LikeResponse;
import com.biblioo.feed.infrastructure.dto.mapper.ReviewMapper;
import com.biblioo.feed.infrastructure.dto.review.ReviewBasicResponse;
import com.biblioo.feed.infrastructure.dto.review.ReviewResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Set;
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/feed/reviews")
@Tag(name = "Reviews", description = "Gerenciamento de avaliações de livros no feed")
public class ReviewController {

  private final ReviewUseCase reviewUseCase;
  private final ReviewMapper reviewMapper;
  private final LikeStatusResolver likeStatusResolver;

  public ReviewController(
      ReviewUseCase reviewUseCase,
      ReviewMapper reviewMapper,
      LikeStatusResolver likeStatusResolver) {
    this.reviewUseCase = reviewUseCase;
    this.reviewMapper = reviewMapper;
    this.likeStatusResolver = likeStatusResolver;
  }

  @PostMapping
  @Operation(
      summary = "Cria uma avaliação",
      description =
          "Cria e publica imediatamente uma avaliação de um livro com nota (1-5) e texto opcional.")
  public ResponseEntity<ReviewResponse> createReview(
      @AuthenticationPrincipal UserDetails principal,
      @Parameter(description = "ID do livro avaliado", example = "1") @RequestParam("bookId")
          Long bookId,
      @Parameter(description = "Nota dada ao livro (1 a 5)", example = "5") @RequestParam("rating")
          Integer rating,
      @Parameter(description = "Texto da avaliação (até 2000 caracteres)")
          @RequestParam(value = "text", required = false)
          String text) {
    if (rating < 1 || rating > 5) {
      throw new ReviewBusinessException("A avaliação deve ser entre 1 e 5");
    }
    if (text != null && text.length() > 2000) {
      throw new ReviewBusinessException("O texto da avaliação não deve exceder 2000 caracteres");
    }

    Long userId = Long.parseLong(principal.getUsername());
    Review result = reviewUseCase.createReview(userId, bookId, rating, sanitize(text));
    return ResponseEntity.status(HttpStatus.CREATED).body(reviewMapper.toResponse(result));
  }

  @PutMapping("/{reviewId}")
  @Operation(
      summary = "Atualiza uma avaliação",
      description = "Atualiza nota e/ou texto de uma avaliação já existente de autoria do usuário.")
  public ResponseEntity<ReviewResponse> updateReview(
      @AuthenticationPrincipal UserDetails principal,
      @Parameter(description = "ID da avaliação", example = "1") @PathVariable Long reviewId,
      @Parameter(description = "Novo texto de resenha (até 2000 caracteres)")
          @RequestParam(value = "text", required = false)
          String text,
      @Parameter(description = "Nova nota aplicada ao livro (1 a 5)", example = "4")
          @RequestParam(value = "rating", required = false)
          Integer rating) {

    if (text != null && text.length() > 2000) {
      throw new ReviewBusinessException("O texto da avaliação não deve exceder 2000 caracteres");
    }
    if (rating != null && (rating < 1 || rating > 5)) {
      throw new ReviewBusinessException("A avaliação deve ser entre 1 e 5");
    }

    Long userId = Long.parseLong(principal.getUsername());
    Review result = reviewUseCase.updateReview(userId, reviewId, rating, sanitize(text));
    return ResponseEntity.ok(reviewMapper.toResponse(result));
  }

  @DeleteMapping("/{reviewId}")
  @Operation(summary = "Apaga uma avaliação")
  public ResponseEntity<Void> deleteReview(
      @AuthenticationPrincipal UserDetails principal,
      @Parameter(description = "ID da avaliação", example = "1") @PathVariable Long reviewId) {

    Long userId = Long.parseLong(principal.getUsername());
    reviewUseCase.deleteReview(userId, reviewId);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/{reviewId}")
  @Operation(summary = "Obtém uma avaliação por ID")
  public ResponseEntity<ReviewResponse> getReview(
      @AuthenticationPrincipal UserDetails principal,
      @Parameter(description = "ID da avaliação", example = "1") @PathVariable Long reviewId) {

    Long viewerId = principal != null ? Long.parseLong(principal.getUsername()) : null;
    Review review = reviewUseCase.getReviewById(reviewId);
    return ResponseEntity.ok(
        reviewMapper
            .toResponse(review)
            .copyWithLikeStatus(likeStatusResolver.isLiked(viewerId, reviewId)));
  }

  @GetMapping("/{reviewId}/basic")
  @Operation(summary = "Obtém informações resumidas de uma avaliação")
  public ResponseEntity<ReviewBasicResponse> getReviewBasic(
      @Parameter(description = "ID da avaliação", example = "1") @PathVariable Long reviewId) {

    return ResponseEntity.ok(reviewMapper.toBasicResponse(reviewUseCase.getReviewById(reviewId)));
  }

  @GetMapping("/user/{userId}")
  @Operation(summary = "Lista avaliações de um usuário")
  public ResponseEntity<Page<ReviewResponse>> getUserReviews(
      @AuthenticationPrincipal UserDetails principal,
      @Parameter(description = "ID do usuário", example = "1") @PathVariable Long userId,
      @PageableDefault(size = 10) Pageable pageable) {

    Long viewerId = principal != null ? Long.parseLong(principal.getUsername()) : null;
    Page<Review> reviews = reviewUseCase.getRecentReviewsByUserId(userId, pageable);
    List<Long> ids = reviews.getContent().stream().map(Review::getId).toList();
    Set<Long> likedIds = likeStatusResolver.resolve(viewerId, ids);
    return ResponseEntity.ok(
        reviews.map(
            r -> reviewMapper.toResponse(r).copyWithLikeStatus(likedIds.contains(r.getId()))));
  }

  @GetMapping("/user/{userId}/basic")
  @Operation(summary = "Lista avaliações resumidas de um usuário")
  public ResponseEntity<Page<ReviewBasicResponse>> getUserReviewsBasic(
      @Parameter(description = "ID do usuário", example = "1") @PathVariable Long userId,
      @PageableDefault(size = 10) Pageable pageable) {

    return ResponseEntity.ok(
        reviewUseCase
            .getRecentReviewsByUserId(userId, pageable)
            .map(reviewMapper::toBasicResponse));
  }

  @PostMapping("/{reviewId}/like")
  @Operation(
      summary = "Curtir ou remover curtida da avaliação",
      description = "Adiciona uma curtida se ainda não curtida; remove se já curtida.")
  public ResponseEntity<LikeResponse> likeReview(
      @AuthenticationPrincipal UserDetails principal,
      @Parameter(description = "ID da avaliação", example = "1") @PathVariable Long reviewId) {

    Long userId = Long.parseLong(principal.getUsername());
    return ResponseEntity.ok(new LikeResponse(reviewUseCase.likeReview(userId, reviewId)));
  }

  private String sanitize(String html) {
    if (html == null) return null;
    return Jsoup.clean(html, Safelist.none());
  }
}
