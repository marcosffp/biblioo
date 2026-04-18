package com.biblioo.books.infrasestructure.web;

import com.biblioo.books.domain.model.Book;
import com.biblioo.books.domain.model.ShelfItem;
import com.biblioo.books.domain.port.in.BookUseCase;
import com.biblioo.books.domain.port.in.ShelfUseCase;
import com.biblioo.books.infrasestructure.dto.mapper.ShelfItemMapper;
import com.biblioo.books.infrasestructure.dto.shelfItem.AddShelfItemRequest;
import com.biblioo.books.infrasestructure.dto.shelfItem.ChangeItemStatusRequest;
import com.biblioo.books.infrasestructure.dto.shelfItem.ShelfItemProgressResponse;
import com.biblioo.books.infrasestructure.dto.shelfItem.ShelfItemResponse;
import com.biblioo.books.infrasestructure.dto.shelfItem.ShelfItemSummaryResponse;
import com.biblioo.books.infrasestructure.dto.shelfItem.UpdateProgressRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping("/shelves/{shelfId}/items")
@RequiredArgsConstructor
@Tag(name = "Shelf Items", description = "Gerenciamento de livros e progresso dentro das estantes")
public class ShelfItemController {

  private final ShelfUseCase shelfUseCase;
  private final BookUseCase bookUseCase;
  private final ShelfItemMapper mapper;

  @GetMapping
  @Operation(
      summary = "Lista itens da estante",
      description =
          "Retorna todos os livros de uma determinada estante com os detalhes de progresso de leitura.")
  public ResponseEntity<List<ShelfItemSummaryResponse>> listItems(
      @AuthenticationPrincipal UserDetails principal,
      @Parameter(description = "ID da estante", example = "1") @PathVariable Long shelfId) {

    Long userId = currentUserId(principal);
    List<ShelfItem> items = shelfUseCase.listShelfItems(userId, shelfId);

    List<ShelfItemSummaryResponse> response =
        items.stream()
            .map(
                item -> {
                  Book book = bookUseCase.getById(item.getBookId());
                  return mapper.toSummaryResponse(item, book);
                })
            .toList();

    return ResponseEntity.ok(response);
  }

  @GetMapping("/{itemId}")
  @Operation(
      summary = "Detalhes do item da estante",
      description =
          "Retorna os detalhes completos do livro na estante (status, resenha, progresso).")
  public ResponseEntity<ShelfItemResponse> getItem(
      @AuthenticationPrincipal UserDetails principal,
      @Parameter(description = "ID da estante", example = "1") @PathVariable Long shelfId,
      @Parameter(description = "ID do item", example = "1") @PathVariable Long itemId) {

    Long userId = currentUserId(principal);
    ShelfItem item = shelfUseCase.getShelfItemById(userId, shelfId, itemId);
    Book book = bookUseCase.getById(item.getBookId());

    return ResponseEntity.ok(mapper.toResponse(item, book));
  }

  @GetMapping("/user/{userId}")
  @Operation(
      summary = "Lista itens da estante de um usuário",
      description = "Retorna todos os livros de uma determinada estante de um usuário específico.")
  public ResponseEntity<List<ShelfItemSummaryResponse>> listUserItems(
      @Parameter(description = "ID do usuário", example = "1") @PathVariable Long userId,
      @Parameter(description = "ID da estante", example = "1") @PathVariable Long shelfId) {

    List<ShelfItem> items = shelfUseCase.listShelfItems(userId, shelfId);

    List<ShelfItemSummaryResponse> response =
        items.stream()
            .map(
                item -> {
                  Book book = bookUseCase.getById(item.getBookId());
                  return mapper.toSummaryResponse(item, book);
                })
            .toList();

    return ResponseEntity.ok(response);
  }

  @GetMapping("/user/{userId}/{itemId}")
  @Operation(
      summary = "Detalhes do item da estante de um usuário",
      description = "Retorna os detalhes completos do livro na estante de um usuário específico.")
  public ResponseEntity<ShelfItemResponse> getUserItem(
      @Parameter(description = "ID do usuário", example = "1") @PathVariable Long userId,
      @Parameter(description = "ID da estante", example = "1") @PathVariable Long shelfId,
      @Parameter(description = "ID do item", example = "1") @PathVariable Long itemId) {

    ShelfItem item = shelfUseCase.getShelfItemById(userId, shelfId, itemId);
    Book book = bookUseCase.getById(item.getBookId());

    return ResponseEntity.ok(mapper.toResponse(item, book));
  }

  @PostMapping
  @Operation(
      summary = "Adiciona livro à estante",
      description = "Adiciona um novo livro a uma estante específica do usuário.")
  public ResponseEntity<ShelfItemProgressResponse> addItem(
      @AuthenticationPrincipal UserDetails principal,
      @Parameter(description = "ID da estante", example = "1") @PathVariable Long shelfId,
      @Valid @RequestBody AddShelfItemRequest request) {

    Long userId = currentUserId(principal);
    ShelfItem item =
        shelfUseCase.addShelfItem(userId, shelfId, request.bookId(), request.initialStatus());

    Book book = bookUseCase.getById(item.getBookId());

    URI location =
        ServletUriComponentsBuilder.fromCurrentRequest()
            .path("/{itemId}")
            .buildAndExpand(item.getId())
            .toUri();

    return ResponseEntity.created(location).body(mapper.toProgressResponse(item, book));
  }

  @DeleteMapping("/{itemId}")
  @Operation(summary = "Remove livro da estante")
  public ResponseEntity<Void> removeItem(
      @AuthenticationPrincipal UserDetails principal,
      @Parameter(description = "ID da estante", example = "1") @PathVariable Long shelfId,
      @Parameter(description = "ID do item", example = "1") @PathVariable Long itemId) {

    Long userId = currentUserId(principal);
    shelfUseCase.removeShelfItem(userId, shelfId, itemId);
    return ResponseEntity.noContent().build();
  }

  @PatchMapping("/{itemId}/progress")
  @Operation(
      summary = "Atualiza o progresso de leitura",
      description =
          "Permite alterar a página em que o usuário está para livros com status de leitura ativa.")
  public ResponseEntity<ShelfItemProgressResponse> updateProgress(
      @AuthenticationPrincipal UserDetails principal,
      @Parameter(description = "ID da estante", example = "1") @PathVariable Long shelfId,
      @Parameter(description = "ID do item", example = "1") @PathVariable Long itemId,
      @Valid @RequestBody UpdateProgressRequest request) {

    Long userId = currentUserId(principal);
    ShelfItem updated =
        shelfUseCase.updateItemProgress(userId, shelfId, itemId, request.currentPage());

    Book book = bookUseCase.getById(updated.getBookId());

    return ResponseEntity.ok(mapper.toProgressResponse(updated, book));
  }

  @PatchMapping("/{itemId}/status")
  @Operation(
      summary = "Altera o status do item na estante",
      description = "Ex: Move o livro de QUERO_LER para LENDO ou LIDO.")
  public ResponseEntity<ShelfItemProgressResponse> changeStatus(
      @AuthenticationPrincipal UserDetails principal,
      @Parameter(description = "ID da estante", example = "1") @PathVariable Long shelfId,
      @Parameter(description = "ID do item", example = "1") @PathVariable Long itemId,
      @Valid @RequestBody ChangeItemStatusRequest request) {

    Long userId = currentUserId(principal);
    ShelfItem updated = shelfUseCase.changeItemStatus(userId, shelfId, itemId, request.newStatus());

    Book book = bookUseCase.getById(updated.getBookId());

    return ResponseEntity.ok(mapper.toProgressResponse(updated, book));
  }

  private Long currentUserId(UserDetails principal) {
    return Long.parseLong(principal.getUsername());
  }
}
