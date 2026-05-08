package com.biblioo.trending.infrastructure.web;

import com.biblioo.trending.domain.port.in.TrendingUseCase;
import com.biblioo.trending.infrastructure.dto.TrendingBookResponse;
import com.biblioo.trending.infrastructure.dto.TrendingCommunityResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/trending")
@RequiredArgsConstructor
@Tag(name = "Trending", description = "Top 10 comunidades e livros do momento")
public class TrendingController {

  private final TrendingUseCase trendingUseCase;

  @GetMapping("/communities")
  @Operation(summary = "Top 10 comunidades com maior atividade recente")
  public ResponseEntity<List<TrendingCommunityResponse>> getTopCommunities() {
    List<TrendingCommunityResponse> response =
        trendingUseCase.getTopCommunities().stream()
            .map(TrendingCommunityResponse::from)
            .toList();
    return ResponseEntity.ok(response);
  }

  @GetMapping("/books")
  @Operation(summary = "Top 10 livros em tendência nas últimas 48h")
  public ResponseEntity<List<TrendingBookResponse>> getTopBooks() {
    List<TrendingBookResponse> response =
        trendingUseCase.getTopBooks().stream().map(TrendingBookResponse::from).toList();
    return ResponseEntity.ok(response);
  }
}
