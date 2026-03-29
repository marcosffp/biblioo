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
import java.io.IOException;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping("/shelves/{shelfId}/items")
@RequiredArgsConstructor
@Tag(name = "Shelf Items", description = "Gerenciamento de livros e progresso dentro das estantes")
public class ShelfItemController {

  private static final long MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB
  private static final Set<String> ALLOWED_MIME_TYPES =
      Set.of("image/jpeg", "image/png", "image/webp", "image/gif");

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

  @PatchMapping(value = "/{itemId}/review", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @Operation(
      summary = "Avalía e faz resenha do livro",
      description =
          "Apenas disponível se o status de leitura for READING. Suporta envio de imagens/gifs.")
  public ResponseEntity<ShelfItemResponse> reviewItem(
      @AuthenticationPrincipal UserDetails principal,
      @Parameter(description = "ID da estante", example = "1") @PathVariable Long shelfId,
      @Parameter(description = "ID do item", example = "1") @PathVariable Long itemId,
      @RequestParam(value = "rating") Integer rating,
      @RequestParam(value = "reviewText", required = false) String reviewText,
      @RequestParam(value = "files", required = false) List<MultipartFile> files)
      throws IOException {

    Long userId = currentUserId(principal);

    List<byte[]> filesBytes = new ArrayList<>();
    if (files != null && !files.isEmpty()) {
      for (MultipartFile file : files) {
        validateImageFile(file);
        filesBytes.add(file.getBytes());
      }
    }

    shelfUseCase.reviewItem(userId, shelfId, itemId, rating, reviewText, filesBytes);
    ShelfItem updated = shelfUseCase.getShelfItemById(userId, shelfId, itemId);
    Book book = bookUseCase.getById(updated.getBookId());
    return ResponseEntity.ok(mapper.toResponse(updated, book));
  }

  @DeleteMapping("/{itemId}/review")
  @Operation(
      summary = "Remove a avaliação do livro",
      description =
          "Remove a nota, texto e as imagens associadas à avaliação do livro de forma assíncrona.")
  public ResponseEntity<ShelfItemResponse> deleteReview(
      @AuthenticationPrincipal UserDetails principal,
      @Parameter(description = "ID da estante", example = "1") @PathVariable Long shelfId,
      @Parameter(description = "ID do item", example = "1") @PathVariable Long itemId) {

    Long userId = currentUserId(principal);

    shelfUseCase.deleteReview(userId, shelfId, itemId);

    ShelfItem updated = shelfUseCase.getShelfItemById(userId, shelfId, itemId);
    Book book = bookUseCase.getById(updated.getBookId());

    return ResponseEntity.ok(mapper.toResponse(updated, book));
  }

  private Long currentUserId(UserDetails principal) {
    return Long.parseLong(principal.getUsername());
  }

  private void validateImageFile(MultipartFile file) {
    if (file.isEmpty()) {
      throw new IllegalArgumentException("O arquivo de imagem não pode estar vazio");
    }
    if (file.getSize() > MAX_UPLOAD_BYTES) {
      throw new IllegalArgumentException("O arquivo excede o tamanho máximo de 5MB");
    }
    String contentType = file.getContentType();
    if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType)) {
      throw new IllegalArgumentException(
          "Tipo de arquivo inválido. Tipos aceitos: JPEG, PNG, WebP, GIF");
    }
  }
}
