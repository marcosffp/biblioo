package com.biblioo.recommendation.infrastructure.web;

import com.biblioo.recommendation.domain.port.in.GenreUseCase;
import com.biblioo.recommendation.infrastructure.dto.GenreResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/genres")
@RequiredArgsConstructor
@Tag(name = "Genres", description = "Gêneros literários disponíveis na plataforma")
public class GenreController {

  private final GenreUseCase genreUseCase;

  @GetMapping
  @Operation(
      summary = "Listar todos os gêneros",
      description =
          "Retorna todos os gêneros existentes na plataforma com tradução dinâmica para PT-BR. "
              + "Resultado deduplicado, normalizado e ordenado alfabeticamente pelo nome em português. "
              + "Use o campo 'original' ao enviar preferências de volta ao backend. "
              + "Resultado é cacheado por 6 horas.")
  public ResponseEntity<List<GenreResponse>> getAllGenres() {
    List<GenreResponse> genres = genreUseCase.getAllGenres().stream().map(GenreResponse::from).toList();
    return ResponseEntity.ok(genres);
  }
}
