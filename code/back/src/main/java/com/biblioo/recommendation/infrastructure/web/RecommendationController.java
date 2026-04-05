package com.biblioo.recommendation.infrastructure.web;

import com.biblioo.books.domain.model.Book;
import com.biblioo.books.domain.port.in.BookUseCase;
import com.biblioo.recommendation.domain.model.BookScore;
import com.biblioo.recommendation.domain.port.in.RecommendationUseCase;
import com.biblioo.recommendation.infrastructure.dto.RecommendationResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/recommendations")
@RequiredArgsConstructor
@Tag(name = "Recommendations", description = "Recomendações personalizadas de livros")
public class RecommendationController {

  private final RecommendationUseCase recommendationUseCase;
  private final BookUseCase bookUseCase;

  @GetMapping("/because-you-read")
  @Operation(
      summary = "Because You Read",
      description =
          "Retorna livros recomendados com base em co-leitura (T1 — BECAUSE_YOU_READ). "
              + "O score é composto por co-leitura (40%), avaliação média (30%), "
              + "categoria (20%) e popularidade (10%).")
  public ResponseEntity<List<RecommendationResponse>> getBecauseYouRead(
      @AuthenticationPrincipal UserDetails principal) {
    Long userId = Long.parseLong(principal.getUsername());
    List<BookScore> scores = recommendationUseCase.getBecauseYouRead(userId);

    List<RecommendationResponse> response =
        scores.stream()
            .map(
                score -> {
                  Book book = bookUseCase.getById(score.getBookId());
                  return RecommendationResponse.builder()
                      .id(book.getId())
                      .title(book.getTitle())
                      .description(book.getDescription())
                      .pageCount(book.getPageCount())
                      .readerCount(book.getReaderCount())
                      .averageRating(book.getAverageRating())
                      .coverUrl(book.getCoverUrl())
                      .score(score.getScore())
                      .build();
                })
            .toList();

    return ResponseEntity.ok(response);
  }
}
