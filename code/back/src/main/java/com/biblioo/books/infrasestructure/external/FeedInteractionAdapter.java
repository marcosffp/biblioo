package com.biblioo.books.infrasestructure.external;

import com.biblioo.books.domain.model.Book;
import com.biblioo.books.domain.model.ReadingStatus;
import com.biblioo.books.domain.model.Shelf;
import com.biblioo.books.domain.model.ShelfItem;
import com.biblioo.books.domain.port.in.BookUseCase;
import com.biblioo.books.domain.port.in.ShelfUseCase;
import com.biblioo.books.infrasestructure.persistence.BookRepository;
import com.biblioo.books.infrasestructure.persistence.ShelfItemRepository;
import com.biblioo.books.infrasestructure.persistence.ShelfRepository;
import com.biblioo.community.domain.port.out.CommunityBookLookupPort;
import com.biblioo.feed.domain.port.out.BookPort;
import com.biblioo.feed.domain.port.out.ShelfInteractionPort;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class FeedInteractionAdapter implements BookPort, ShelfInteractionPort, CommunityBookLookupPort {

  private final BookUseCase bookUseCase;
  private final BookRepository bookRepository;
  private final ShelfUseCase shelfUseCase;
  private final ShelfRepository shelfRepository;
  private final ShelfItemRepository shelfItemRepository;

  @Override
  public Book getBookById(Long bookId) {
    return bookUseCase.getById(bookId);
  }

  @Override
  public boolean existsById(Long bookId) {
    return bookRepository.existsById(bookId);
  }

  @Override
  public void ensureBookReadStatusIsCompleted(Long userId, Long bookId) {
    List<Shelf> shelves = shelfRepository.findAllByUserId(userId);

    boolean hasBook = false;
    boolean alreadyCompleted = false;
    ShelfItem itemToUpdate = null;
    Shelf targetShelf = null;

    for (Shelf shelf : shelves) {
      Optional<ShelfItem> optItem =
          shelfItemRepository.findByShelfIdAndBookId(shelf.getId(), bookId);
      if (optItem.isPresent()) {
        hasBook = true;
        ShelfItem item = optItem.get();
        if (item.getStatus() == ReadingStatus.COMPLETED) {
          alreadyCompleted = true;
          break;
        } else if (itemToUpdate == null) {
          itemToUpdate = item;
          targetShelf = shelf;
        }
      }
    }

    if (alreadyCompleted) {
      return;
    }

    if (hasBook && itemToUpdate != null) {
      shelfUseCase.changeItemStatus(
          userId, targetShelf.getId(), itemToUpdate.getId(), ReadingStatus.COMPLETED);
    } else {
      Shelf mainShelf;
      if (shelves.isEmpty()) {
        mainShelf =
            shelfUseCase.createShelf(
                userId, "Lidos", "Criada automaticamente via avaliação de livros.");
      } else {
        mainShelf = shelves.get(0);
      }
      shelfUseCase.addShelfItem(userId, mainShelf.getId(), bookId, ReadingStatus.COMPLETED);
    }
  }
}
