package com.biblioo.feed.infrastructure.web;

import com.biblioo.feed.domain.exception.ReviewBusinessException;
import com.biblioo.feed.domain.model.Review;
import com.biblioo.feed.domain.port.in.ReviewUseCase;
import com.biblioo.feed.infrastructure.dto.mapper.ReviewMapper;
import com.biblioo.feed.infrastructure.dto.review.ReviewResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/feed/reviews")
public class ReviewController {

  private final ReviewUseCase reviewUseCase;
  private final ReviewMapper reviewMapper;

  public ReviewController(ReviewUseCase reviewUseCase, ReviewMapper reviewMapper) {
    this.reviewUseCase = reviewUseCase;
    this.reviewMapper = reviewMapper;
  }

  @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<ReviewResponse> createReview(
      @AuthenticationPrincipal UserDetails principal,
      @RequestParam("bookId") Long bookId,
      @RequestParam("rating") Integer rating,
      @RequestParam(value = "text", required = false) String text,
      @RequestPart(value = "images", required = false) List<MultipartFile> images,
      @RequestPart(value = "gif", required = false) MultipartFile gif) {

    if (rating < 1 || rating > 5) {
      throw new ReviewBusinessException("A avaliação deve ser entre 1 e 5");
    }
    if (text != null && text.length() > 2000) {
      throw new ReviewBusinessException("O texto da avaliação não deve exceder 2000 caracteres");
    }

    Long userId = Long.parseLong(principal.getUsername());

    String safeText = sanitize(text);

    validateFiles(images, gif);

    List<byte[]> newImages = parseImages(images);

    byte[] gifBytes = parseGif(gif);

    Review result =
        reviewUseCase.createReview(userId, bookId, rating, safeText, newImages, gifBytes);

    return ResponseEntity.status(HttpStatus.CREATED).body(reviewMapper.toResponse(result));
  }

  @PutMapping(value = "/{reviewId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<ReviewResponse> updateReview(
      @AuthenticationPrincipal UserDetails principal,
      @PathVariable Long reviewId,
      @RequestParam(value = "text", required = false) String text,
      @RequestParam(value = "rating", required = false) Integer rating,
      @RequestParam(value = "imagesToDeleteUrls", required = false) List<String> imagesToDeleteUrls,
      @RequestPart(value = "images", required = false) List<MultipartFile> images,
      @RequestPart(value = "gif", required = false) MultipartFile gif) {

    if (text == null || text.trim().isEmpty()) {
      throw new ReviewBusinessException("O texto da avaliação é obrigatório");
    }
    if (text.length() > 2000) {
      throw new ReviewBusinessException("O texto da avaliação não deve exceder 2000 caracteres");
    }
    if (rating != null && (rating < 1 || rating > 5)) {
      throw new ReviewBusinessException("A avaliação deve ser entre 1 e 5");
    }

    Long userId = Long.parseLong(principal.getUsername());
    String safeText = sanitize(text);
    validateFiles(images, gif);

    List<byte[]> newImages = parseImages(images);
    byte[] gifBytes = parseGif(gif);

    Review result =
        reviewUseCase.updateReview(
            userId, reviewId, rating, safeText, newImages, imagesToDeleteUrls, gifBytes);
    return ResponseEntity.ok(reviewMapper.toResponse(result));
  }

  @DeleteMapping("/{reviewId}")
  public ResponseEntity<Void> deleteReview(
      @AuthenticationPrincipal UserDetails principal, @PathVariable Long reviewId) {

    Long userId = Long.parseLong(principal.getUsername());
    reviewUseCase.deleteReview(userId, reviewId);
    return ResponseEntity.noContent().build();
  }

  @PostMapping("/{reviewId}/like")
  public ResponseEntity<Void> likeReview(
      @AuthenticationPrincipal UserDetails principal, @PathVariable Long reviewId) {

    Long userId = Long.parseLong(principal.getUsername());
    reviewUseCase.likeReview(userId, reviewId);
    return ResponseEntity.ok().build();
  }

  private String sanitize(String html) {
    if (html == null) return null;
    return html.replaceAll("<[^>]*>", "");
  }

  private void validateFiles(List<MultipartFile> images, MultipartFile gif) {
    if (images != null) {
      if (images.size() > 5) {
        throw new ReviewBusinessException("Máximo 5 imagens permitidas");
      }
      images.forEach(this::validateImageFile);
    }
    if (gif != null) {
      String ct = gif.getContentType();
      if (ct == null || !ct.equals("image/gif")) {
        throw new ReviewBusinessException("O GIF deve ser image/gif");
      }
      if (gif.getSize() > 10 * 1024 * 1024) { // 10MB
        throw new ReviewBusinessException("O limite de tamanho do GIF foi excedido");
      }
    }
  }

  private void validateImageFile(MultipartFile file) {
    String ct = file.getContentType();
    if (ct == null
        || (!ct.equals("image/jpeg") && !ct.equals("image/png") && !ct.equals("image/webp"))) {
      throw new ReviewBusinessException("A imagem deve ser JPEG, PNG ou WebP");
    }
    if (file.getSize() > 5 * 1024 * 1024) { // 5MB limit
      throw new ReviewBusinessException("O limite de tamanho da imagem foi excedido");
    }
  }

  private List<byte[]> parseImages(List<MultipartFile> images) {
    if (images == null) return new ArrayList<>();
    return new ArrayList<>(
        images.stream()
            .map(
                img -> {
                  try {
                    return img.getBytes();
                  } catch (IOException e) {
                    throw new ResponseStatusException(
                        HttpStatus.INTERNAL_SERVER_ERROR, "Falha ao ler o byte array da imagem.");
                  }
                })
            .toList());
  }

  private byte[] parseGif(MultipartFile gif) {
    if (gif == null) return null;
    try {
      return gif.getBytes();
    } catch (IOException e) {
      throw new ResponseStatusException(
          HttpStatus.INTERNAL_SERVER_ERROR, "Falha ao ler o byte array do gif.");
    }
  }
}
