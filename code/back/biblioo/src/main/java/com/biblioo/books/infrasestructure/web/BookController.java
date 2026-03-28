package com.biblioo.books.infrasestructure.web;

import com.biblioo.books.domain.port.in.BookUseCase;
import com.biblioo.books.infrasestructure.dto.book.BookResponse;
import com.biblioo.books.infrasestructure.dto.book.BookSuggestResponse;
import com.biblioo.books.infrasestructure.dto.mapper.BookMapper;
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
@Validated // habilita @NotBlank/@Min/etc. direto em @RequestParam e @PathVariable
public class BookController {

    private final BookUseCase bookUseCase;
    private final BookMapper  bookMapper;

    // @NotBlank substitui o if (q.isBlank()) manual — o GlobalExceptionHandler
    // captura o ConstraintViolationException e devolve 400 + mensagem padronizada.
    @GetMapping("/search")
    public ResponseEntity<List<BookResponse>> search(
            @RequestParam @NotBlank(message = "O parâmetro de busca não pode ser vazio.") String q) {

        return ResponseEntity.ok(
                bookUseCase.search(q.trim()).stream().map(bookMapper::toResponse).toList());
    }

    // suggest: vazio é válido — autocomplete ainda sem texto digitado.
    // Retorna lista vazia intencionalmente, sem erro.
    // Não usa @NotBlank.
    @GetMapping("/suggest")
    public ResponseEntity<List<BookSuggestResponse>> suggest(@RequestParam String q) {
        if (q.isBlank()) return ResponseEntity.ok(List.of());

        return ResponseEntity.ok(
                bookUseCase.suggest(q.trim()).stream().map(bookMapper::toSuggestResponse).toList());
    }

    // @PathVariable Long — Spring converte automaticamente.
    // Se vier "abc", lança MethodArgumentTypeMismatchException → handler → 400.
    // Nenhuma anotação extra necessária.
    @GetMapping("/{id}")
    public ResponseEntity<BookResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(bookMapper.toResponse(bookUseCase.getById(id)));
    }
}