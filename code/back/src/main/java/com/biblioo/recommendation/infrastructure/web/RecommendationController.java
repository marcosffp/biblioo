package com.biblioo.recommendation.infrastructure.web;

import com.biblioo.books.domain.model.Book;
import com.biblioo.books.domain.port.in.BookUseCase;
import com.biblioo.recommendation.domain.model.BecauseYouReadResult;
import com.biblioo.recommendation.domain.model.BookScore;
import com.biblioo.recommendation.domain.model.CatalogSurpriseResult;
import com.biblioo.recommendation.domain.model.FavoriteGenreNowResult;
import com.biblioo.recommendation.domain.model.RereadWorthItResult;
import com.biblioo.recommendation.domain.model.SimilarAuthorsResult;
import com.biblioo.recommendation.domain.model.TrendingInCommunitiesResult;
import com.biblioo.recommendation.domain.port.in.RecommendationUseCase;
import com.biblioo.recommendation.infrastructure.dto.BecauseYouReadResponse;
import com.biblioo.recommendation.infrastructure.dto.CatalogSurpriseResponse;
import com.biblioo.recommendation.infrastructure.dto.FavoriteGenreNowResponse;
import com.biblioo.recommendation.infrastructure.dto.RecommendationResponse;
import com.biblioo.recommendation.infrastructure.dto.RereadWorthItResponse;
import com.biblioo.recommendation.infrastructure.dto.SimilarAuthorsResponse;
import com.biblioo.recommendation.infrastructure.dto.TrendingInCommunitiesResponse;
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
      summary = "Porque Você Leu",
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

  @GetMapping("/trending-in-communities")
  @Operation(
      summary = "Em Alta nas Comunidades",
      description =
          "Retorna os livros que estão gerando mais engajamento nas comunidades agora, usando "
              + "Exponential Decay Scoring. Comentários valem 2× mais que entradas. "
              + "Score decai 10%/hora. Livros abaixo do limiar são completados por novidades "
              + "dos últimos 60 dias ordenadas por avaliação.")
  public ResponseEntity<TrendingInCommunitiesResponse> getTrendingInCommunities(
      @AuthenticationPrincipal UserDetails principal) {

    Long userId = Long.parseLong(principal.getUsername());
    TrendingInCommunitiesResult result = recommendationUseCase.getTrendingInCommunities(userId);

    return ResponseEntity.ok(
        TrendingInCommunitiesResponse.builder()
            .books(toRecommendationResponses(result.getBooks()))
            .build());
  }

  @GetMapping("/catalog-surprise")
  @Operation(
      summary = "Surpresa do Catálogo",
      description =
          "Recomenda livros de categorias que o usuário nunca ou raramente explorou, "
              + "priorizando títulos bem avaliados globalmente. "
              + "Usa Thompson Sampling (Multi-Armed Bandit) para equilibrar exploração e "
              + "explotação: livros em categorias distantes do perfil do usuário recebem "
              + "peso maior. Cold start tratado pelo prior Beta(1,1) — distribuição uniforme.")
  public ResponseEntity<CatalogSurpriseResponse> getCatalogSurprise(
      @AuthenticationPrincipal UserDetails principal) {

    Long userId = Long.parseLong(principal.getUsername());
    CatalogSurpriseResult result = recommendationUseCase.getCatalogSurprise(userId);

    return ResponseEntity.ok(
        CatalogSurpriseResponse.builder()
            .books(toRecommendationResponses(result.getBooks()))
            .build());
  }

  @GetMapping("/similar-authors")
  @Operation(
      summary = "Autores Similares",
      description =
          "Recomenda livros com base em autores que o usuário já aprovou (nível 1) e autores "
              + "descobertos por leitores com histórico parecido (nível 2). "
              + "Nível 1 (autores confirmados): autores de livros concluídos com avaliação ≥ 4 "
              + "estrelas e finalizados há mais de 7 dias. Score: [0.6, 1.0]. "
              + "Nível 2 (autores descobertos): collaborative filtering SQL — autores aprovados "
              + "por leitores similares que o usuário nunca leu. Score: [0.3, 0.7]. "
              + "Livros sem avaliação usam nota neutra 3 (não confirmam autor). "
              + "Fallback: livros mais bem avaliados globalmente quando sem candidatos.")
  public ResponseEntity<SimilarAuthorsResponse> getSimilarAuthors(
      @AuthenticationPrincipal UserDetails principal) {

    Long userId = Long.parseLong(principal.getUsername());
    SimilarAuthorsResult result = recommendationUseCase.getSimilarAuthors(userId);

    return ResponseEntity.ok(
        SimilarAuthorsResponse.builder()
            .books(toRecommendationResponses(result.getBooks()))
            .build());
  }

  @GetMapping("/reread-worth-it")
  @Operation(
      summary = "Releituras que Valem",
      description =
          "Reapresenta livros que o usuário já leu no momento ideal para releitura, calculado por "
              + "Spaced Repetition. O intervalo cresce com a avaliação do usuário e se multiplica "
              + "a cada releitura confirmada. Livros concluídos há menos de 90 dias são excluídos. "
              + "Score: maturidade do intervalo (70%) + avaliação do usuário (30%). "
              + "Fallback para novos usuários: livros mais bem avaliados globalmente.")
  public ResponseEntity<RereadWorthItResponse> getRereadWorthIt(
      @AuthenticationPrincipal UserDetails principal) {

    Long userId = Long.parseLong(principal.getUsername());
    RereadWorthItResult result = recommendationUseCase.getRereadWorthIt(userId);

    return ResponseEntity.ok(
        RereadWorthItResponse.builder()
            .books(toRecommendationResponses(result.getBooks()))
            .build());
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
