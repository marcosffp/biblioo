package com.biblioo.books.infrasestructure.web;

import com.biblioo.books.domain.model.Book;
import com.biblioo.books.domain.model.ShelfItem;
import com.biblioo.books.domain.port.in.BookUseCase;
import com.biblioo.books.domain.port.in.ShelfUseCase;
import com.biblioo.books.infrasestructure.dto.mapper.ShelfItemMapper;
import com.biblioo.books.infrasestructure.dto.shelfItem.AddShelfItemRequest;
import com.biblioo.books.infrasestructure.dto.shelfItem.ChangeItemStatusRequest;
import com.biblioo.books.infrasestructure.dto.shelfItem.ReviewItemRequest;
import com.biblioo.books.infrasestructure.dto.shelfItem.ShelfItemProgressResponse;
import com.biblioo.books.infrasestructure.dto.shelfItem.ShelfItemResponse;
import com.biblioo.books.infrasestructure.dto.shelfItem.ShelfItemSummaryResponse;
import com.biblioo.books.infrasestructure.dto.shelfItem.UpdateProgressRequest;

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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping("/shelves/{shelfId}/items")
@RequiredArgsConstructor
public class ShelfItemController {

    private final ShelfUseCase shelfUseCase;
    private final BookUseCase bookUseCase;
    private final ShelfItemMapper mapper;

    @GetMapping
    public ResponseEntity<List<ShelfItemSummaryResponse>> listItems(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long shelfId) {

        List<ShelfItem> items = shelfUseCase.listShelfItems(userId, shelfId);

        List<ShelfItemSummaryResponse> response = items.stream()
                .map(item -> {
                    Book book = bookUseCase.getById(item.getBookId());
                    return mapper.toSummaryResponse(item, book);
                })
                .toList();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{itemId}")
    public ResponseEntity<ShelfItemResponse> getItem(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long shelfId,
            @PathVariable Long itemId) {

        ShelfItem item = shelfUseCase.getShelfItemById(userId, shelfId, itemId);
        Book book = bookUseCase.getById(item.getBookId());

        return ResponseEntity.ok(mapper.toResponse(item, book));
    }

    @PostMapping
    public ResponseEntity<ShelfItemProgressResponse> addItem(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long shelfId,
            @Valid @RequestBody AddShelfItemRequest request) {

        ShelfItem item = shelfUseCase.addShelfItem(
                userId,
                shelfId,
                request.bookId(),
                request.initialStatus());

        Book book = bookUseCase.getById(item.getBookId());

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{itemId}")
                .buildAndExpand(item.getId())
                .toUri();

        return ResponseEntity.created(location).body(mapper.toProgressResponse(item, book));
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> removeItem(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long shelfId,
            @PathVariable Long itemId) {

        shelfUseCase.removeShelfItem(userId, shelfId, itemId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{itemId}/progress")
    public ResponseEntity<ShelfItemProgressResponse> updateProgress(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long shelfId,
            @PathVariable Long itemId,
            @Valid @RequestBody UpdateProgressRequest request) {

        ShelfItem updated = shelfUseCase.updateItemProgress(userId, shelfId, itemId, request.currentPage());

        Book book = bookUseCase.getById(updated.getBookId());

        return ResponseEntity.ok(mapper.toProgressResponse(updated, book));
    }

    @PatchMapping("/{itemId}/status")
    public ResponseEntity<ShelfItemProgressResponse> changeStatus(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long shelfId,
            @PathVariable Long itemId,
            @Valid @RequestBody ChangeItemStatusRequest request) {

        ShelfItem updated = shelfUseCase.changeItemStatus(userId, shelfId, itemId, request.newStatus());

        Book book = bookUseCase.getById(updated.getBookId());

        return ResponseEntity.ok(mapper.toProgressResponse(updated, book));
    }

    @PatchMapping("/{itemId}/review")
    public ResponseEntity<ShelfItemResponse> reviewItem(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long shelfId,
            @PathVariable Long itemId,
            @Valid @RequestBody ReviewItemRequest request) {

        shelfUseCase.reviewItem(userId, shelfId, itemId, request.rating(), request.reviewText());
        ShelfItem updated = shelfUseCase.getShelfItemById(userId, shelfId, itemId);
        Book book = bookUseCase.getById(updated.getBookId());
        return ResponseEntity.ok(mapper.toResponse(updated, book));
    }
}