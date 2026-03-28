package com.biblioo.books.infrasestructure.web;

import com.biblioo.books.domain.model.Collection;
import com.biblioo.books.domain.model.Shelf;
import com.biblioo.books.domain.model.ShelfItem;
import com.biblioo.books.domain.port.in.BookUseCase;
import com.biblioo.books.domain.port.in.CollectionUseCase;
import com.biblioo.books.domain.port.in.ShelfUseCase;
import com.biblioo.books.infrasestructure.dto.collection.AddShelfToCollectionRequest;
import com.biblioo.books.infrasestructure.dto.collection.CollectionResponse;
import com.biblioo.books.infrasestructure.dto.collection.CollectionSummaryResponse;
import com.biblioo.books.infrasestructure.dto.collection.CreateCollectionRequest;
import com.biblioo.books.infrasestructure.dto.collection.ShelfPreview;
import com.biblioo.books.infrasestructure.dto.collection.UpdateCollectionRequest;
import com.biblioo.books.infrasestructure.dto.mapper.CollectionMapper;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

/**
 * Gerencia coleções do usuário (Collection).
 *
 * Uma coleção agrupa estantes. Cada response inclui até 6 ShelfPreviews —
 * cada preview contém o nome da estante e a capa do seu primeiro livro,
 * permitindo que a UI renderize o grid da coleção sem chamadas extras.
 *
 * userId é extraído do header X-User-Id — autenticação já resolvida pelo gateway.
 */
@RestController
@RequestMapping("/collections")
@RequiredArgsConstructor
public class CollectionController {

    private static final int SHELF_PREVIEW_LIMIT = 6;

    private final CollectionUseCase collectionUseCase;
    private final ShelfUseCase      shelfUseCase;
    private final BookUseCase       bookUseCase;
    private final CollectionMapper  mapper;

    // =========================================================================
    // GET /collections
    // Lista todas as coleções do usuário no formato resumido.
    // =========================================================================

    @GetMapping
    public ResponseEntity<List<CollectionSummaryResponse>> listCollections(
            @RequestHeader("X-User-Id") Long userId) {

        List<Collection> collections = collectionUseCase.listCollections(userId);

        List<CollectionSummaryResponse> response = collections.stream()
                .map(col -> {
                    List<ShelfPreview> previews = buildShelfPreviews(col.getShelves(), userId);
                    return mapper.toSummaryResponse(col, previews);
                })
                .toList();

        return ResponseEntity.ok(response);
    }

    // =========================================================================
    // GET /collections/{collectionId}
    // Detalhes completos de uma coleção específica.
    // =========================================================================

    @GetMapping("/{collectionId}")
    public ResponseEntity<CollectionResponse> getCollection(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long collectionId) {

        Collection col             = collectionUseCase.getCollection(userId, collectionId);
        List<ShelfPreview> previews = buildShelfPreviews(col.getShelves(), userId);

        return ResponseEntity.ok(mapper.toResponse(col, previews));
    }

    // =========================================================================
    // POST /collections
    // Cria uma nova coleção, opcionalmente já com estantes vinculadas.
    // =========================================================================

    @PostMapping
    public ResponseEntity<CollectionResponse> createCollection(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody CreateCollectionRequest request) {

        Collection col = collectionUseCase.createCollection(
                userId,
                request.name(),
                request.description(),
                request.initialShelfIds());

        List<ShelfPreview> previews = buildShelfPreviews(col.getShelves(), userId);

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{collectionId}")
                .buildAndExpand(col.getId())
                .toUri();

        return ResponseEntity.created(location).body(mapper.toResponse(col, previews));
    }

    // =========================================================================
    // PUT /collections/{collectionId}
    // Atualiza nome e/ou descrição de uma coleção.
    // =========================================================================

    @PutMapping("/{collectionId}")
    public ResponseEntity<CollectionResponse> updateCollection(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long collectionId,
            @Valid @RequestBody UpdateCollectionRequest request) {

        Collection col = collectionUseCase.updateCollection(
                userId, collectionId, request.name(), request.description());

        // Recarrega com estantes para montar os previews após update.
        Collection colWithShelves  = collectionUseCase.getCollection(userId, col.getId());
        List<ShelfPreview> previews = buildShelfPreviews(colWithShelves.getShelves(), userId);

        return ResponseEntity.ok(mapper.toResponse(colWithShelves, previews));
    }

    // =========================================================================
    // PATCH /collections/{collectionId}/shelves  →  adiciona uma estante
    // =========================================================================

    @PatchMapping("/{collectionId}/shelves")
    public ResponseEntity<CollectionResponse> addShelf(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long collectionId,
            @Valid @RequestBody AddShelfToCollectionRequest request) {

        collectionUseCase.addShelfToCollection(userId, collectionId, request.shelfId());

        Collection updated          = collectionUseCase.getCollection(userId, collectionId);
        List<ShelfPreview> previews = buildShelfPreviews(updated.getShelves(), userId);

        return ResponseEntity.ok(mapper.toResponse(updated, previews));
    }

    // =========================================================================
    // DELETE /collections/{collectionId}/shelves/{shelfId}  →  remove uma estante
    // =========================================================================

    @DeleteMapping("/{collectionId}/shelves/{shelfId}")
    public ResponseEntity<CollectionResponse> removeShelf(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long collectionId,
            @PathVariable Long shelfId) {

        collectionUseCase.removeShelfFromCollection(userId, collectionId, shelfId);

        Collection updated          = collectionUseCase.getCollection(userId, collectionId);
        List<ShelfPreview> previews = buildShelfPreviews(updated.getShelves(), userId);

        return ResponseEntity.ok(mapper.toResponse(updated, previews));
    }

    // =========================================================================
    // DELETE /collections/{collectionId}
    // Deleta a coleção (não deleta as estantes, apenas o vínculo).
    // =========================================================================

    @DeleteMapping("/{collectionId}")
    public ResponseEntity<Void> deleteCollection(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long collectionId) {

        collectionUseCase.deleteCollection(userId, collectionId);
        return ResponseEntity.noContent().build();
    }

    // =========================================================================
    // Helpers privados
    // =========================================================================

    /**
     * Constrói até {@value SHELF_PREVIEW_LIMIT} ShelfPreviews a partir das estantes da coleção.
     *
     * Para cada estante:
     *  1. Carrega os itens via ShelfUseCase (respeita ownership e soft delete).
     *  2. Pega o primeiro item que tenha coverUrl não nula — capa do preview.
     *  3. Monta o ShelfPreview com nome, contagem e capa.
     *
     * Falhas isoladas (livro removido do catálogo, estante sem itens) não
     * interrompem o processamento — o preview é gerado com coverUrl null.
     */
    private List<ShelfPreview> buildShelfPreviews(List<Shelf> shelves, Long userId) {
        if (shelves == null || shelves.isEmpty()) {
            return List.of();
        }

        return shelves.stream()
                .limit(SHELF_PREVIEW_LIMIT)
                .map(shelf -> {
                    List<ShelfItem> items = loadItemsSafely(userId, shelf.getId());
                    String cover         = resolveFirstCover(items);
                    return new ShelfPreview(shelf.getId(), shelf.getName(), items.size(), cover);
                })
                .toList();
    }

    /**
     * Carrega os itens de uma estante sem lançar exceção caso a estante
     * tenha sido deletada ou o usuário perdeu acesso entre requests.
     */
    private List<ShelfItem> loadItemsSafely(Long userId, Long shelfId) {
        try {
            return shelfUseCase.listShelfItems(userId, shelfId);
        } catch (Exception e) {
            return List.of();
        }
    }

    /**
     * Retorna a coverUrl do primeiro livro da estante que possua capa cadastrada.
     * Retorna null se a estante estiver vazia ou nenhum livro tiver capa.
     */
    private String resolveFirstCover(List<ShelfItem> items) {
        return items.stream()
                .map(item -> {
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
}