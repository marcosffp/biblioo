package com.biblioo.books.infrasestructure.web;

import com.biblioo.books.domain.port.in.BookUseCase;
import com.biblioo.books.infrasestructure.dto.BookResponse;
import com.biblioo.books.infrasestructure.dto.BookSuggestResponse;
import com.biblioo.books.infrasestructure.dto.mapper.BookMapper;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/books")
@RequiredArgsConstructor
public class BookController {

  private final BookUseCase bookUseCase;
  private final BookMapper bookMapper;

  @GetMapping("/search")
  public ResponseEntity<List<BookResponse>> search(@RequestParam String q) {
    if (q == null || q.isBlank()) {
      return ResponseEntity.badRequest().build();
    }
    return ResponseEntity.ok(
        bookUseCase.search(q.trim()).stream().map(bookMapper::toResponse).toList());
  }

  @GetMapping("/suggest")
  public ResponseEntity<List<BookSuggestResponse>> suggest(@RequestParam String q) {
    if (q == null || q.isBlank()) {
      return ResponseEntity.ok(List.of());
    }
    return ResponseEntity.ok(
        bookUseCase.suggest(q.trim()).stream().map(bookMapper::toSuggestResponse).toList());
  }

  @GetMapping("/{id}")
  public ResponseEntity<BookResponse> getById(@PathVariable Long id) {
    return ResponseEntity.ok(bookMapper.toResponse(bookUseCase.getById(id)));
  }
}
