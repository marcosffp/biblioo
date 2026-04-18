package com.biblioo.books.infrasestructure.web;

import com.biblioo.books.domain.model.Collection;
import com.biblioo.books.domain.model.Shelf;
import com.biblioo.books.domain.model.ShelfItem;
import com.biblioo.books.domain.port.in.BookUseCase;
import com.biblioo.books.domain.port.in.CollectionUseCase;
import com.biblioo.books.domain.port.in.ShelfUseCase;
import com.biblioo.books.domain.service.CollectionStatsService;
import com.biblioo.books.infrasestructure.dto.collection.AddShelfToCollectionRequest;
import com.biblioo.books.infrasestructure.dto.collection.CollectionResponse;
import com.biblioo.books.infrasestructure.dto.collection.CollectionStatsResponse;
import com.biblioo.books.infrasestructure.dto.collection.CollectionSummaryResponse;
import com.biblioo.books.infrasestructure.dto.collection.CreateCollectionRequest;
import com.biblioo.books.infrasestructure.dto.collection.ShelfPreview;
import com.biblioo.books.infrasestructure.dto.collection.UpdateCollectionRequest;
import com.biblioo.books.infrasestructure.dto.mapper.CollectionMapper;
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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping("/collections")
@RequiredArgsConstructor
@Tag(name = "Collections", description = "Gerenciamento de coleções de estantes")
public class CollectionController {

  private static final int SHELF_PREVIEW_LIMIT = 6;

  private final CollectionUseCase collectionUseCase;
  private final ShelfUseCase shelfUseCase;
  private final BookUseCase bookUseCase;
  private final CollectionStatsService statsService;
  private final CollectionMapper mapper;

  @GetMapping
  @Operation(
      summary = "Lista coleções do usuário",
      description = "Retorna todas as coleções do usuário autenticado no formato resumido.")
  public ResponseEntity<List<CollectionSummaryResponse>> listCollections(
      @AuthenticationPrincipal UserDetails principal) {

    Long userId = currentUserId(principal);
    List<Collection> collections = collectionUseCase.listCollections(userId);

    List<CollectionSummaryResponse> response =
        collections.stream()
            .map(
                col -> {
                  List<ShelfPreview> previews = buildShelfPreviews(col.getShelves(), userId);
                  return mapper.toSummaryResponse(col, previews);
                })
            .toList();

    return ResponseEntity.ok(response);
  }

  @GetMapping("/{collectionId}")
  @Operation(
      summary = "Detalhes de uma coleção",
      description = "Retorna os detalhes completos de uma coleção específica.")
  public ResponseEntity<CollectionResponse> getCollection(
      @AuthenticationPrincipal UserDetails principal,
      @Parameter(description = "ID da coleção", example = "1") @PathVariable Long collectionId) {

    Long userId = currentUserId(principal);
    Collection col = collectionUseCase.getCollection(userId, collectionId);
    List<ShelfPreview> previews = buildShelfPreviews(col.getShelves(), userId);

    return ResponseEntity.ok(mapper.toResponse(col, previews, statsService.computeStats(col)));
  }

  @GetMapping("/user/{userId}")
  @Operation(
      summary = "Lista coleções de um usuário específico",
      description = "Retorna todas as coleções de um usuário específico no formato resumido.")
  public ResponseEntity<List<CollectionSummaryResponse>> listUserCollections(
      @Parameter(description = "ID do usuário", example = "1") @PathVariable Long userId) {

    List<Collection> collections = collectionUseCase.listCollections(userId);

    List<CollectionSummaryResponse> response =
        collections.stream()
            .map(
                col -> {
                  List<ShelfPreview> previews = buildShelfPreviews(col.getShelves(), userId);
                  return mapper.toSummaryResponse(col, previews);
                })
            .toList();

    return ResponseEntity.ok(response);
  }

  @GetMapping("/user/{userId}/{collectionId}")
  @Operation(
      summary = "Detalhes de uma coleção de um usuário específico",
      description = "Retorna os detalhes completos de uma coleção específica de um usuário.")
  public ResponseEntity<CollectionResponse> getUserCollection(
      @Parameter(description = "ID do usuário", example = "1") @PathVariable Long userId,
      @Parameter(description = "ID da coleção", example = "1") @PathVariable Long collectionId) {

    Collection col = collectionUseCase.getCollection(userId, collectionId);
    List<ShelfPreview> previews = buildShelfPreviews(col.getShelves(), userId);

    return ResponseEntity.ok(mapper.toResponse(col, previews, statsService.computeStats(col)));
  }

  @PostMapping
  @Operation(
      summary = "Cria uma coleção",
      description = "Cria uma nova coleção, opcionalmente já com estantes vinculadas.")
  public ResponseEntity<CollectionResponse> createCollection(
      @AuthenticationPrincipal UserDetails principal,
      @Valid @RequestBody CreateCollectionRequest request) {

    Long userId = currentUserId(principal);
    Collection col =
        collectionUseCase.createCollection(
            userId, request.name(), request.description(), request.initialShelfIds());

    List<ShelfPreview> previews = buildShelfPreviews(col.getShelves(), userId);

    URI location =
        ServletUriComponentsBuilder.fromCurrentRequest()
            .path("/{collectionId}")
            .buildAndExpand(col.getId())
            .toUri();

    return ResponseEntity.created(location).body(mapper.toResponse(col, previews, null));
  }

  @PutMapping("/{collectionId}")
  @Operation(
      summary = "Atualiza uma coleção",
      description = "Atualiza nome e/ou descrição de uma coleção.")
  public ResponseEntity<CollectionResponse> updateCollection(
      @AuthenticationPrincipal UserDetails principal,
      @Parameter(description = "ID da coleção", example = "1") @PathVariable Long collectionId,
      @Valid @RequestBody UpdateCollectionRequest request) {

    Long userId = currentUserId(principal);
    Collection col =
        collectionUseCase.updateCollection(
            userId, collectionId, request.name(), request.description());

    Collection colWithShelves = collectionUseCase.getCollection(userId, col.getId());
    List<ShelfPreview> previews = buildShelfPreviews(colWithShelves.getShelves(), userId);

    return ResponseEntity.ok(mapper.toResponse(colWithShelves, previews, null));
  }

  @PatchMapping("/{collectionId}/shelves")
  @Operation(
      summary = "Adiciona estante à coleção",
      description = "Vincula uma estante existente a uma coleção.")
  public ResponseEntity<CollectionResponse> addShelf(
      @AuthenticationPrincipal UserDetails principal,
      @Parameter(description = "ID da coleção", example = "1") @PathVariable Long collectionId,
      @Valid @RequestBody AddShelfToCollectionRequest request) {

    Long userId = currentUserId(principal);
    collectionUseCase.addShelfToCollection(userId, collectionId, request.shelfId());
    Collection updated = collectionUseCase.getCollection(userId, collectionId);
    List<ShelfPreview> previews = buildShelfPreviews(updated.getShelves(), userId);

    return ResponseEntity.ok(mapper.toResponse(updated, previews, null));
  }

  @DeleteMapping("/{collectionId}/shelves/{shelfId}")
  @Operation(
      summary = "Remove estante da coleção",
      description = "Remove o vínculo de uma estante a uma coleção. A estante não é apagada.")
  public ResponseEntity<CollectionResponse> removeShelf(
      @AuthenticationPrincipal UserDetails principal,
      @Parameter(description = "ID da coleção", example = "1") @PathVariable Long collectionId,
      @Parameter(description = "ID da estante", example = "1") @PathVariable Long shelfId) {

    Long userId = currentUserId(principal);
    collectionUseCase.removeShelfFromCollection(userId, collectionId, shelfId);
    Collection updated = collectionUseCase.getCollection(userId, collectionId);
    List<ShelfPreview> previews = buildShelfPreviews(updated.getShelves(), userId);

    return ResponseEntity.ok(mapper.toResponse(updated, previews, null));
  }

  @DeleteMapping("/{collectionId}")
  @Operation(
      summary = "Deleta uma coleção",
      description = "Deleta a coleção (não deleta as estantes, apenas o vínculo).")
  public ResponseEntity<Void> deleteCollection(
      @AuthenticationPrincipal UserDetails principal,
      @Parameter(description = "ID da coleção", example = "1") @PathVariable Long collectionId) {

    Long userId = currentUserId(principal);
    collectionUseCase.deleteCollection(userId, collectionId);
    return ResponseEntity.noContent().build();
  }

  private List<ShelfPreview> buildShelfPreviews(List<Shelf> shelves, Long userId) {
    if (shelves == null || shelves.isEmpty()) {
      return List.of();
    }

    return shelves.stream()
        .limit(SHELF_PREVIEW_LIMIT)
        .map(
            shelf -> {
              List<ShelfItem> items = loadItemsSafely(userId, shelf.getId());
              String cover = resolveFirstCover(items);
              return new ShelfPreview(shelf.getId(), shelf.getName(), items.size(), cover);
            })
        .toList();
  }

  private List<ShelfItem> loadItemsSafely(Long userId, Long shelfId) {
    try {
      return shelfUseCase.listShelfItems(userId, shelfId);
    } catch (Exception e) {
      return List.of();
    }
  }

  private String resolveFirstCover(List<ShelfItem> items) {
    return items.stream()
        .map(
            item -> {
              try {
                return bookUseCase.getById(item.getBookId()).getCoverUrl();
              } catch (Exception e) {
                return null;
              }
            })
        .filter(url -> url != null && !url.isBlank())
        .findFirst()
        .orElse(null);
  }

  private Long currentUserId(UserDetails principal) {
    return Long.parseLong(principal.getUsername());
  }
}
