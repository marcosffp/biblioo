package com.biblioo.books.domain.service;

import com.biblioo.books.domain.exception.ShelfBusinessException;
import com.biblioo.books.domain.model.Collection;
import com.biblioo.books.domain.model.Shelf;
import com.biblioo.books.infrasestructure.persistence.CollectionRepository;
import com.biblioo.books.infrasestructure.persistence.ShelfRepository;
import java.util.concurrent.CompletableFuture;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CollectionShelfService {

  private final CollectionRepository collectionRepository;
  private final ShelfRepository shelfRepository;

  @Async("collectionExecutor")
  @Transactional
  @Caching(
      evict = {
        @CacheEvict(value = "collection-detail", key = "#userId + ':' + #collectionId"),
        @CacheEvict(value = "collection-list", key = "#userId")
      })
  public CompletableFuture<Void> addShelfAsync(Long userId, Long collectionId, Long shelfId) {
    Collection collection =
        collectionRepository
            .findByIdAndUserIdWithShelves(collectionId, userId)
            .orElseThrow(() -> new ShelfBusinessException("Coleção não encontrada."));

    Shelf shelf =
        shelfRepository
            .findByIdAndUserId(shelfId, userId)
            .orElseThrow(() -> new ShelfBusinessException("Estante não encontrada."));

    boolean alreadyExists =
        collection.getShelves().stream()
            .anyMatch(existing -> existing.getId().equals(shelf.getId()));

    if (!alreadyExists) {
      collection.getShelves().add(shelf);
      collectionRepository.save(collection);
    }

    return CompletableFuture.completedFuture(null);
  }

  @Async("collectionExecutor")
  @Transactional
  @Caching(
      evict = {
        @CacheEvict(value = "collection-detail", key = "#userId + ':' + #collectionId"),
        @CacheEvict(value = "collection-list", key = "#userId")
      })
  public CompletableFuture<Void> removeShelfAsync(Long userId, Long collectionId, Long shelfId) {
    Collection collection =
        collectionRepository
            .findByIdAndUserIdWithShelves(collectionId, userId)
            .orElseThrow(() -> new ShelfBusinessException("Coleção não encontrada."));

    boolean removed = collection.getShelves().removeIf(shelf -> shelf.getId().equals(shelfId));

    if (removed) {
      collectionRepository.save(collection);
    }

    return CompletableFuture.completedFuture(null);
  }
}
