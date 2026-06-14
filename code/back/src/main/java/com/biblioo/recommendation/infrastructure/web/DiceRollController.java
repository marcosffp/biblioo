package com.biblioo.recommendation.infrastructure.web;

import com.biblioo.books.domain.model.Book;
import com.biblioo.books.domain.port.in.BookUseCase;
import com.biblioo.recommendation.domain.port.in.DiceRollUseCase;
import com.biblioo.recommendation.infrastructure.dto.DiceRollResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/roll-dice")
@RequiredArgsConstructor
@Tag(name = "Dice Roll", description = "Jogar o Dado - Recomendação Aleatória")
public class DiceRollController {

  private final DiceRollUseCase diceRollUseCase;
  private final BookUseCase bookUseCase;

  @GetMapping()
  @Operation(
      summary = "Jogar o Dado",
      description =
          "Sorteia um livro de forma uniforme a partir do pool combinado das 6 trilhas de "
              + "recomendação do usuário (sem peso, sem histórico). Quando nenhuma trilha possui "
              + "candidatos (usuário novo), o sorteio recai sobre os livros mais populares da "
              + "plataforma. Retorna 204 apenas se o catálogo estiver completamente vazio.")
  public ResponseEntity<?> rollDice(@AuthenticationPrincipal UserDetails principal) {
    Long userId = Long.parseLong(principal.getUsername());
    Long bookId = diceRollUseCase.rollDice(userId).getBookId();

    if (bookId == null) {
      return ResponseEntity.noContent().build();
    }

    Book book = bookUseCase.getById(bookId);
    return ResponseEntity.ok(
        DiceRollResponse.builder()
            .id(book.getId())
            .title(book.getTitle())
            .description(book.getDescription())
            .pageCount(book.getPageCount())
            .readerCount(book.getReaderCount())
            .averageRating(book.getAverageRating())
            .coverUrl(book.getCoverUrl())
            .build());
  }
}
