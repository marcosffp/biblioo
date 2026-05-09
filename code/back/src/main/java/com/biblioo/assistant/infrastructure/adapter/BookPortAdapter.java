package com.biblioo.assistant.infrastructure.adapter;

import com.biblioo.assistant.domain.model.BookResult;
import com.biblioo.assistant.domain.port.out.AssistantBookPort;
import com.biblioo.books.domain.port.in.BookUseCase;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
class BookPortAdapter implements AssistantBookPort {

  private final BookUseCase bookUseCase;

  @Override
  public List<BookResult> search(String query, int limit) {
    try {
      return bookUseCase.search(query).stream()
          .limit(limit)
          .map(b -> {
            List<String> authors;
            try {
              authors = List.copyOf(b.getAuthors());
            } catch (Exception e) {
              authors = List.of();
            }
            return new BookResult(b.getId(), b.getTitle(), authors, b.getAverageRating());
          })
          .toList();
    } catch (Exception e) {
      log.warn("Erro na busca de livros: {}", e.getMessage());
      return List.of();
    }
  }
}
