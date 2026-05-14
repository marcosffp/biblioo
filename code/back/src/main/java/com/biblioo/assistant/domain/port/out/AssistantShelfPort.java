package com.biblioo.assistant.domain.port.out;

import com.biblioo.assistant.domain.model.ShelfItemBasic;
import com.biblioo.assistant.domain.model.ShelfResult;
import java.util.List;

public interface AssistantShelfPort {

  List<ShelfResult> listShelves(Long userId);

  ShelfResult createShelf(Long userId, String name, String description);

  List<ShelfItemBasic> listShelfItems(Long userId, Long shelfId);

  String addBookToShelf(Long userId, Long shelfId, Long bookId, String status);

  String changeItemStatus(Long userId, Long shelfId, Long itemId, String newStatus);

  String updateReadingProgress(Long userId, Long shelfId, Long itemId, Integer currentPage);
}
