package com.biblioo.books.domain.port.in;

import com.biblioo.books.domain.model.ReadingStatus;
import com.biblioo.books.domain.model.Shelf;
import com.biblioo.books.domain.model.ShelfItem;
import java.util.List;

public interface ShelfUseCase {

  List<Shelf> listShelves(Long userId);

  Shelf getShelf(Long userId, Long shelfId);

  Shelf createShelf(Long userId, String name, String description);

  Shelf updateShelf(Long userId, Long shelfId, String name, String description);

  void deleteShelf(Long userId, Long shelfId);

  ShelfItem addShelfItem(Long userId, Long shelfId, Long bookId, ReadingStatus initialStatus);

  void removeShelfItem(Long userId, Long shelfId, Long itemId);

  ShelfItem updateItemProgress(Long userId, Long shelfId, Long itemId, Integer page);

  ShelfItem changeItemStatus(Long userId, Long shelfId, Long itemId, ReadingStatus newStatus);

  List<ShelfItem> listShelfItems(Long userId, Long shelfId);

  ShelfItem getShelfItemById(Long userId, Long shelfId, Long itemId);

  ShelfItem getShelfItem(Long userId, Long shelfId, Long bookId);
}
