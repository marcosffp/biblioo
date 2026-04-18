package com.biblioo.books.infrasestructure.web;

import com.biblioo.books.domain.exception.ShelfBusinessException;
import com.biblioo.books.domain.model.Shelf;
import com.biblioo.books.domain.model.ShelfItem;
import com.biblioo.books.domain.port.in.BookUseCase;
import com.biblioo.books.domain.port.in.ShelfUseCase;
import com.biblioo.books.infrasestructure.dto.mapper.ShelfMapper;
import com.biblioo.books.infrasestructure.dto.shelf.CreateShelfRequest;
import com.biblioo.books.infrasestructure.dto.shelf.ShelfResponse;
import com.biblioo.books.infrasestructure.dto.shelf.ShelfSummaryResponse;
import com.biblioo.books.infrasestructure.dto.shelf.UpdateShelfRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@Slf4j
@RestController
@RequestMapping("/shelves")
@RequiredArgsConstructor
@Tag(name = "Shelves", description = "Gerenciamento de estantes de livros")
public class ShelfController {

  private static final int COVER_PREVIEW_LIMIT = 4;

  private final ShelfUseCase shelfUseCase;
  private final BookUseCase bookUseCase;
  private final ShelfMapper mapper;

  @GetMapping
  @Operation(
      summary = "Lista estantes",
      description = "Retorna todas as estantes do usuário autenticado no formato resumido.")
  public ResponseEntity<List<ShelfSummaryResponse>> listShelves(
      @AuthenticationPrincipal UserDetails principal) {

    Long userId = currentUserId(principal);
    List<Shelf> shelves = shelfUseCase.listShelves(userId);

    List<ShelfSummaryResponse> response =
        shelves.stream()
            .map(
                shelf -> {
                  try {
                    List<ShelfItem> items = shelfUseCase.listShelfItems(userId, shelf.getId());
                    List<String> covers = buildCoverPreview(items);
                    return mapper.toSummaryResponse(shelf, items.size(), covers);
                  } catch (ShelfBusinessException e) {
                    return null;
                  }
                })
            .filter(Objects::nonNull)
            .toList();

    return ResponseEntity.ok(response);
  }

  @GetMapping("/{shelfId}")
  @Operation(
      summary = "Detalhes de uma estante",
      description = "Retorna os detalhes completos de uma estante.")
  public ResponseEntity<ShelfResponse> getShelf(
      @AuthenticationPrincipal UserDetails principal,
      @Parameter(description = "ID da estante", example = "1") @PathVariable Long shelfId) {

    Long userId = currentUserId(principal);
    Shelf shelf = shelfUseCase.getShelf(userId, shelfId);
    List<ShelfItem> items = shelfUseCase.listShelfItems(userId, shelfId);
    List<String> covers = buildCoverPreview(items);

    return ResponseEntity.ok(mapper.toResponse(shelf, items.size(), covers));
  }

  @GetMapping("/user/{userId}")
  @Operation(
      summary = "Lista estantes de um usuário específico",
      description = "Retorna todas as estantes de um usuário específico no formato resumido.")
  public ResponseEntity<List<ShelfSummaryResponse>> listUserShelves(
      @Parameter(description = "ID do usuário", example = "1") @PathVariable Long userId) {

    List<Shelf> shelves = shelfUseCase.listShelves(userId);

    List<ShelfSummaryResponse> response =
        shelves.stream()
            .map(
                shelf -> {
                  try {
                    List<ShelfItem> items = shelfUseCase.listShelfItems(userId, shelf.getId());
                    List<String> covers = buildCoverPreview(items);
                    return mapper.toSummaryResponse(shelf, items.size(), covers);
                  } catch (ShelfBusinessException e) {
                    return null;
                  }
                })
            .filter(Objects::nonNull)
            .toList();

    return ResponseEntity.ok(response);
  }

  @GetMapping("/user/{userId}/{shelfId}")
  @Operation(
      summary = "Detalhes de uma estante de um usuário",
      description = "Retorna os detalhes completos de uma estante de um usuário específico.")
  public ResponseEntity<ShelfResponse> getUserShelf(
      @Parameter(description = "ID do usuário", example = "1") @PathVariable Long userId,
      @Parameter(description = "ID da estante", example = "1") @PathVariable Long shelfId) {

    Shelf shelf = shelfUseCase.getShelf(userId, shelfId);
    List<ShelfItem> items = shelfUseCase.listShelfItems(userId, shelfId);
    List<String> covers = buildCoverPreview(items);

    return ResponseEntity.ok(mapper.toResponse(shelf, items.size(), covers));
  }

  @PostMapping
  @Operation(
      summary = "Cria uma estante",
      description = "Cria uma nova estante para o usuário autenticado.")
  public ResponseEntity<ShelfResponse> createShelf(
      @AuthenticationPrincipal UserDetails principal,
      @Valid @RequestBody CreateShelfRequest request) {

    Long userId = currentUserId(principal);
    Shelf shelf = shelfUseCase.createShelf(userId, request.name(), request.description());
    URI location =
        ServletUriComponentsBuilder.fromCurrentRequest()
            .path("/{shelfId}")
            .buildAndExpand(shelf.getId())
            .toUri();

    return ResponseEntity.created(location).body(mapper.toResponse(shelf, 0, List.of()));
  }

  @PutMapping("/{shelfId}")
  @Operation(
      summary = "Atualiza uma estante",
      description = "Atualiza o nome e/ou descrição de uma estante.")
  public ResponseEntity<ShelfResponse> updateShelf(
      @AuthenticationPrincipal UserDetails principal,
      @Parameter(description = "ID da estante", example = "1") @PathVariable Long shelfId,
      @Valid @RequestBody UpdateShelfRequest request) {

    Long userId = currentUserId(principal);
    Shelf shelf = shelfUseCase.updateShelf(userId, shelfId, request.name(), request.description());
    List<ShelfItem> items = shelfUseCase.listShelfItems(userId, shelfId);
    List<String> covers = buildCoverPreview(items);
    return ResponseEntity.ok(mapper.toResponse(shelf, items.size(), covers));
  }

  @DeleteMapping("/{shelfId}")
  @Operation(
      summary = "Deleta uma estante",
      description = "Deleta a estante e todos os itens (livros) contidos nela.")
  public ResponseEntity<Void> deleteShelf(
      @AuthenticationPrincipal UserDetails principal,
      @Parameter(description = "ID da estante", example = "1") @PathVariable Long shelfId) {

    Long userId = currentUserId(principal);
    shelfUseCase.deleteShelf(userId, shelfId);
    return ResponseEntity.noContent().build();
  }

  private List<String> buildCoverPreview(List<ShelfItem> items) {
    return items.stream()
        .map(
            item -> {
              try {
                return bookUseCase.getById(item.getBookId()).getCoverUrl();
              } catch (Exception e) {
                log.debug(
                    "Cover não encontrada para bookId={}: {}", item.getBookId(), e.getMessage());
                return null;
              }
            })
        .filter(url -> url != null && !url.isBlank())
        .limit(COVER_PREVIEW_LIMIT)
        .toList();
  }

  private Long currentUserId(UserDetails principal) {
    return Long.parseLong(principal.getUsername());
  }
}
