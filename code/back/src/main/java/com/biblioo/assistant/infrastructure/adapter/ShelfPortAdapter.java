package com.biblioo.assistant.infrastructure.adapter;

import com.biblioo.assistant.domain.model.ShelfItemBasic;
import com.biblioo.assistant.domain.model.ShelfResult;
import com.biblioo.assistant.domain.port.out.AssistantShelfPort;
import com.biblioo.books.domain.model.ReadingStatus;
import com.biblioo.books.domain.model.Shelf;
import com.biblioo.books.domain.model.ShelfItem;
import com.biblioo.books.domain.port.in.ShelfUseCase;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
class ShelfPortAdapter implements AssistantShelfPort {

  private final ShelfUseCase shelfUseCase;

  @Override
  public List<ShelfResult> listShelves(Long userId) {
    return shelfUseCase.listShelves(userId).stream()
        .map(s -> new ShelfResult(s.getId(), s.getName(), s.getDescription()))
        .toList();
  }

  @Override
  public ShelfResult createShelf(Long userId, String name, String description) {
    Shelf shelf = shelfUseCase.createShelf(userId, name, description);
    return new ShelfResult(shelf.getId(), shelf.getName(), shelf.getDescription());
  }

  @Override
  public List<ShelfItemBasic> listShelfItems(Long userId, Long shelfId) {
    try {
      return shelfUseCase.listShelfItems(userId, shelfId).stream()
          .map(
              i ->
                  new ShelfItemBasic(
                      i.getId(),
                      i.getBookId(),
                      i.getStatus() != null ? i.getStatus().name() : null,
                      i.getCurrentPage(),
                      i.getTotalPages()))
          .toList();
    } catch (RuntimeException e) {
      return List.of();
    }
  }

  @Override
  public String addBookToShelf(Long userId, Long shelfId, Long bookId, String status) {
    try {
      ReadingStatus rs = ReadingStatus.valueOf(status.toUpperCase());
      ShelfItem item = shelfUseCase.addShelfItem(userId, shelfId, bookId, rs);
      return "Livro adicionado com sucesso. itemId=" + item.getId();
    } catch (RuntimeException e) {
      return "Erro: " + e.getMessage();
    }
  }

  @Override
  public String changeItemStatus(Long userId, Long shelfId, Long itemId, String newStatus) {
    try {
      ReadingStatus rs = ReadingStatus.valueOf(newStatus.toUpperCase());
      shelfUseCase.changeItemStatus(userId, shelfId, itemId, rs);
      return "Status atualizado para " + newStatus;
    } catch (RuntimeException e) {
      return "Erro: " + e.getMessage();
    }
  }

  @Override
  public String updateReadingProgress(Long userId, Long shelfId, Long itemId, Integer currentPage) {
    try {
      shelfUseCase.updateItemProgress(userId, shelfId, itemId, currentPage);
      return "Progresso atualizado para página " + currentPage;
    } catch (RuntimeException e) {
      return "Erro: " + e.getMessage();
    }
  }
}
