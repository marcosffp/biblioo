package com.biblioo.books.infrasestructure.web;

import com.biblioo.books.domain.port.in.BookUseCase;
import com.biblioo.books.infrasestructure.dto.book.BookResponse;
import com.biblioo.books.infrasestructure.dto.book.BookSuggestResponse;
import com.biblioo.books.infrasestructure.dto.mapper.BookMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/books")
@RequiredArgsConstructor
@Validated
@Tag(name = "Books", description = "Busca e catálogo de livros")
public class BookController {

  private final BookUseCase bookUseCase;
  private final BookMapper bookMapper;

  @GetMapping("/search")
  @Operation(summary = "Busca livros", description = "Busca livros por título, autor ou ISBN.")
  public ResponseEntity<List<BookResponse>> search(
      @Parameter(description = "Termo de busca", example = "Harry Potter")
          @RequestParam
          @NotBlank(message = "O parâmetro de busca não pode ser vazio.")
          String q) {

    return ResponseEntity.ok(
        bookUseCase.search(q.trim()).stream().map(bookMapper::toResponse).toList());
  }

  @GetMapping("/suggest")
  @Operation(
      summary = "Sugestões de livros",
      description = "Retorna sugestões rápidas enquanto o usuário digita na busca.")
  public ResponseEntity<List<BookSuggestResponse>> suggest(
      @Parameter(description = "Prefixo de busca", example = "Har") @RequestParam String q) {
    if (q.isBlank()) return ResponseEntity.ok(List.of());

    return ResponseEntity.ok(
        bookUseCase.suggest(q.trim()).stream().map(bookMapper::toSuggestResponse).toList());
  }

  @GetMapping("/{id}")
  @Operation(
      summary = "Detalhes do livro",
      description = "Retorna os detalhes completos de um livro pelo ID.")
  public ResponseEntity<BookResponse> getById(
      @Parameter(description = "ID do livro no banco", example = "1") @PathVariable Long id) {
    return ResponseEntity.ok(bookMapper.toResponse(bookUseCase.getById(id)));
  }
}
