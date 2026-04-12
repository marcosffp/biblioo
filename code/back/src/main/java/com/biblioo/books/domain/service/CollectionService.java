package com.biblioo.books.domain.service;

import com.biblioo.books.domain.exception.ShelfBusinessException;
import com.biblioo.books.domain.model.Collection;
import com.biblioo.books.domain.model.Shelf;
import com.biblioo.books.domain.port.in.CollectionUseCase;
import com.biblioo.books.infrasestructure.persistence.CollectionRepository;
import com.biblioo.books.infrasestructure.persistence.ShelfRepository;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
public class CollectionService implements CollectionUseCase {

  private final CollectionRepository collectionRepository;
  private final ShelfRepository shelfRepository;
  private final CollectionShelfService collectionShelfService;

  @Override
  @Transactional(readOnly = true)
  @Cacheable(value = "collection-list", key = "#userId", unless = "#result.isEmpty()")
  public List<Collection> listCollections(Long userId) {
    return collectionRepository.findAllByUserIdOrderByUpdatedAtDesc(userId);
  }

  @Override
  @Transactional(readOnly = true)
  @Cacheable(value = "collection-detail", key = "#userId + ':' + #collectionId")
  public Collection getCollection(Long userId, Long collectionId) {
    return collectionRepository
        .findByIdAndUserIdWithShelves(collectionId, userId)
        .orElseThrow(
            () -> new ShelfBusinessException("Coleção não encontrada ou não pertence ao usuário."));
  }

  @Override
  @Transactional
  @CacheEvict(value = "collection-list", key = "#userId")
  public Collection createCollection(
      Long userId, String name, String description, List<Long> initialShelfIds) {
    validateName(name);

    if (collectionRepository.existsByUserIdAndName(userId, name.trim())) {
      throw new ShelfBusinessException("Já existe uma coleção com este nome para este usuário.");
    }

    List<Shelf> initialShelves = resolveShelvesForUser(initialShelfIds, userId);

    Collection collection =
        Collection.builder()
            .userId(userId)
            .name(name.trim())
            .description(description)
            .shelves(initialShelves)
            .build();

    return collectionRepository.save(collection);
  }

  @Override
  @Transactional
  @Caching(
      evict = {
        @CacheEvict(value = "collection-detail", key = "#userId + ':' + #collectionId"),
        @CacheEvict(value = "collection-list", key = "#userId")
      })
  public Collection updateCollection(
      Long userId, Long collectionId, String name, String description) {
    Collection collection =
        collectionRepository
            .findByIdAndUserId(collectionId, userId)
            .orElseThrow(
                () ->
                    new ShelfBusinessException(
                        "Coleção não encontrada ou não pertence ao usuário."));

    validateName(name);

    if (collectionRepository.existsByUserIdAndNameExcludingId(userId, name.trim(), collectionId)) {
      throw new ShelfBusinessException("Já existe uma coleção com este nome para este usuário.");
    }

    collection.setName(name.trim());
    collection.setDescription(description);

    return collectionRepository.save(collection);
  }

  @Override
  public void addShelfToCollection(Long userId, Long collectionId, Long shelfId) {
    collectionShelfService.addShelfAsync(userId, collectionId, shelfId).join();
  }

  @Override
  public void removeShelfFromCollection(Long userId, Long collectionId, Long shelfId) {
    collectionShelfService.removeShelfAsync(userId, collectionId, shelfId).join();
  }

  @Override
  @Transactional
  @Caching(
      evict = {
        @CacheEvict(value = "collection-detail", key = "#userId + ':' + #collectionId"),
        @CacheEvict(value = "collection-list", key = "#userId")
      })
  public void deleteCollection(Long userId, Long collectionId) {
    Collection collection =
        collectionRepository
            .findByIdAndUserId(collectionId, userId)
            .orElseThrow(
                () ->
                    new ShelfBusinessException(
                        "Coleção não encontrada ou não pertence ao usuário."));

    collectionRepository.delete(collection);
  }

  private void validateName(String name) {
    if (name == null || name.trim().isEmpty()) {
      throw new ShelfBusinessException("O nome da coleção é obrigatório.");
    }
  }

  private List<Shelf> resolveShelvesForUser(List<Long> shelfIds, Long userId) {
    if (shelfIds == null || shelfIds.isEmpty()) return new ArrayList<>();

    List<Shelf> shelves = shelfRepository.findAllByIdsAndUserId(shelfIds, userId);

    if (shelves.size() != shelfIds.size()) {
      throw new ShelfBusinessException("Uma ou mais estantes informadas não foram encontradas.");
    }

    return shelves;
  }
}
