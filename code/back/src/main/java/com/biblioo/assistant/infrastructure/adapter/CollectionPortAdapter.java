package com.biblioo.assistant.infrastructure.adapter;

import com.biblioo.assistant.domain.model.CollectionResult;
import com.biblioo.assistant.domain.model.ShelfResult;
import com.biblioo.assistant.domain.port.out.AssistantCollectionPort;
import com.biblioo.books.domain.model.Collection;
import com.biblioo.books.domain.port.in.CollectionUseCase;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
class CollectionPortAdapter implements AssistantCollectionPort {

  private final CollectionUseCase collectionUseCase;

  @Override
  public List<CollectionResult> listCollections(Long userId) {
    return collectionUseCase.listCollections(userId).stream().map(this::toResult).toList();
  }

  @Override
  public CollectionResult createCollection(Long userId, String name, String description) {
    Collection collection =
        collectionUseCase.createCollection(userId, name, description, List.of());
    return toResult(collection);
  }

  @Override
  public String addShelfToCollection(Long userId, Long collectionId, Long shelfId) {
    try {
      collectionUseCase.addShelfToCollection(userId, collectionId, shelfId);
      return "Estante adicionada à coleção com sucesso.";
    } catch (RuntimeException e) {
      return "Erro: " + e.getMessage();
    }
  }

  @Override
  public String removeShelfFromCollection(Long userId, Long collectionId, Long shelfId) {
    try {
      collectionUseCase.removeShelfFromCollection(userId, collectionId, shelfId);
      return "Estante removida da coleção com sucesso.";
    } catch (RuntimeException e) {
      return "Erro: " + e.getMessage();
    }
  }

  private CollectionResult toResult(Collection c) {
    List<ShelfResult> shelves =
        c.getShelves().stream()
            .map(s -> new ShelfResult(s.getId(), s.getName(), s.getDescription()))
            .toList();
    return new CollectionResult(c.getId(), c.getName(), c.getDescription(), shelves);
  }
}
