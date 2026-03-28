package com.biblioo.books.infrasestructure.web;

import com.biblioo.books.domain.model.Shelf;
import com.biblioo.books.domain.model.ShelfItem;
import com.biblioo.books.domain.port.in.BookUseCase;
import com.biblioo.books.domain.port.in.ShelfUseCase;
import com.biblioo.books.infrasestructure.dto.mapper.ShelfMapper;
import com.biblioo.books.infrasestructure.dto.shelf.CreateShelfRequest;
import com.biblioo.books.infrasestructure.dto.shelf.ShelfResponse;
import com.biblioo.books.infrasestructure.dto.shelf.ShelfSummaryResponse;
import com.biblioo.books.infrasestructure.dto.shelf.UpdateShelfRequest;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping("/shelves")
@RequiredArgsConstructor
public class ShelfController {

    private static final int COVER_PREVIEW_LIMIT = 4;

    private final ShelfUseCase shelfUseCase;
    private final BookUseCase bookUseCase;
    private final ShelfMapper mapper;

    @GetMapping
    public ResponseEntity<List<ShelfSummaryResponse>> listShelves(
            @RequestHeader("X-User-Id") Long userId) {

        List<Shelf> shelves = shelfUseCase.listShelves(userId);

        List<ShelfSummaryResponse> response = shelves.stream()
                .map(shelf -> {
                    List<ShelfItem> items = shelfUseCase.listShelfItems(userId, shelf.getId());
                    List<String> covers = buildCoverPreview(items);
                    return mapper.toSummaryResponse(shelf, items.size(), covers);
                })
                .toList();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{shelfId}")
    public ResponseEntity<ShelfResponse> getShelf(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long shelfId) {

        Shelf shelf = shelfUseCase.getShelf(userId, shelfId);
        List<ShelfItem> items = shelfUseCase.listShelfItems(userId, shelfId);
        List<String> covers = buildCoverPreview(items);

        return ResponseEntity.ok(mapper.toResponse(shelf, items.size(), covers));
    }

    @PostMapping
    public ResponseEntity<ShelfResponse> createShelf(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody CreateShelfRequest request) {

        Shelf shelf = shelfUseCase.createShelf(userId, request.name(), request.description());
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{shelfId}")
                .buildAndExpand(shelf.getId())
                .toUri();

        return ResponseEntity.created(location)
                .body(mapper.toResponse(shelf, 0, List.of()));
    }

    @PutMapping("/{shelfId}")
    public ResponseEntity<ShelfResponse> updateShelf(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long shelfId,
            @Valid @RequestBody UpdateShelfRequest request) {
        Shelf shelf = shelfUseCase.updateShelf(userId, shelfId, request.name(), request.description());
        List<ShelfItem> items = shelfUseCase.listShelfItems(userId, shelfId);
        List<String> covers = buildCoverPreview(items);
        return ResponseEntity.ok(mapper.toResponse(shelf, items.size(), covers));
    }

    @DeleteMapping("/{shelfId}")
    public ResponseEntity<Void> deleteShelf(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long shelfId) {

        shelfUseCase.deleteShelf(userId, shelfId);
        return ResponseEntity.noContent().build();
    }

    private List<String> buildCoverPreview(List<ShelfItem> items) {
        return items.stream()
                .map(item -> {
                    try {
                        return bookUseCase.getById(item.getBookId()).getCoverUrl();
                    } catch (Exception e) {
                        return null;
                    }
                })
                .filter(url -> url != null && !url.isBlank())
                .limit(COVER_PREVIEW_LIMIT)
                .toList();
    }
}