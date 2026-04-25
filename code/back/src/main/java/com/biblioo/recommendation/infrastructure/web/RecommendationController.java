package com.biblioo.recommendation.infrastructure.web;

import com.biblioo.books.domain.model.Book;
import com.biblioo.books.domain.port.in.BookUseCase;
import com.biblioo.recommendation.domain.model.BecauseYouReadResult;
import com.biblioo.recommendation.domain.model.BookScore;
import com.biblioo.recommendation.domain.model.FavoriteGenreNowResult;
import com.biblioo.recommendation.domain.port.in.RecommendationUseCase;
import com.biblioo.recommendation.infrastructure.dto.BecauseYouReadResponse;
import com.biblioo.recommendation.infrastructure.dto.FavoriteGenreNowResponse;
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
          "Retorna livros recomendados com base em co-leitura (BECAUSE_YOU_READ). "
              + "O campo seedBookTitle indica o título do livro que o usuário acabou de ler "
              + "e que serviu de base para a recomendação. "
              + "Score: co-leitura (40%) + avaliação média (30%) + categoria (20%) + popularidade (10%).")
  public ResponseEntity<BecauseYouReadResponse> getBecauseYouRead(
      @AuthenticationPrincipal UserDetails principal) {
    Long userId = Long.parseLong(principal.getUsername());
    BecauseYouReadResult result = recommendationUseCase.getBecauseYouRead(userId);

    List<RecommendationResponse> books = toRecommendationResponses(result.getBooks());

    return ResponseEntity.ok(
        BecauseYouReadResponse.builder()
            .seedBookTitle(result.getSeedBookTitle())
            .books(books)
            .build());
  }

  @GetMapping("/favorite-genre-now")
  @Operation(
      summary = "Seu Gênero Favorito Agora",
      description =
          "Retorna os livros mais bem avaliados da plataforma nos gêneros de maior afinidade do "
              + "usuário. A afinidade é calculada pela quantidade de livros lidos (peso 70%) e "
              + "pela média das notas que o próprio usuário deu nesses gêneros (peso 30%). "
              + "O campo topGenres indica os gêneros identificados para exibição no front.")
  public ResponseEntity<FavoriteGenreNowResponse> getFavoriteGenreNow(
      @AuthenticationPrincipal UserDetails principal) {
    Long userId = Long.parseLong(principal.getUsername());
    FavoriteGenreNowResult result = recommendationUseCase.getFavoriteGenreNow(userId);

    List<RecommendationResponse> books = toRecommendationResponses(result.getBooks());

    return ResponseEntity.ok(
        FavoriteGenreNowResponse.builder().topGenres(result.getTopGenres()).books(books).build());
  }

  private List<RecommendationResponse> toRecommendationResponses(List<BookScore> scores) {
    return scores.stream()
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
  }
}
