package com.biblioo.books.domain.service;

import com.biblioo.books.domain.exception.ShelfBusinessException;
import com.biblioo.books.domain.model.Book;
import com.biblioo.books.domain.model.ReadingStatus;
import com.biblioo.books.domain.model.Shelf;
import com.biblioo.books.domain.model.ShelfItem;
import com.biblioo.books.domain.port.in.BookUseCase;
import com.biblioo.books.domain.port.in.ShelfUseCase;
import com.biblioo.books.domain.port.out.ReviewImagePort;
import com.biblioo.books.infrasestructure.persistence.ShelfItemRepository;
import com.biblioo.books.infrasestructure.persistence.ShelfRepository;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.AllArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
public class ShelfService implements ShelfUseCase {

  private final ShelfRepository shelfRepository;
  private final ShelfItemRepository shelfItemRepository;
  private final BookUseCase bookUseCase;
  private final ReviewImagePort reviewImagePort;

  @Override
  @Transactional(readOnly = true)
  @Cacheable(value = "shelf-list", key = "#userId", unless = "#result.isEmpty()")
  public List<Shelf> listShelves(Long userId) {
    return shelfRepository.findAllByUserId(userId);
  }

  @Override
  @Transactional(readOnly = true)
  @Cacheable(value = "shelf", key = "#shelfId")
  public Shelf getShelf(Long userId, Long shelfId) {
    return shelfRepository
        .findByIdAndUserId(shelfId, userId)
        .orElseThrow(() -> new ShelfBusinessException("Estante não encontrada"));
  }

  @Override
  @Transactional
  @CacheEvict(value = "shelf-list", key = "#userId")
  public Shelf createShelf(Long userId, String name, String description) {
    validateName(name);

    Shelf shelf = Shelf.builder().userId(userId).name(name.trim()).description(description).build();

    return shelfRepository.save(shelf);
  }

  @Override
  @Transactional
  @Caching(
      evict = {@CacheEvict(value = "shelf-list", key = "#userId")},
      put = {@CachePut(value = "shelf", key = "#shelfId")})
  public Shelf updateShelf(Long userId, Long shelfId, String name, String description) {
    Shelf shelf =
        shelfRepository
            .findByIdAndUserId(shelfId, userId)
            .orElseThrow(() -> new ShelfBusinessException("Estante não encontrada"));

    validateName(name);
    String trimmedName = name.trim();

    boolean isNameUnchanged = shelf.getName().equals(trimmedName);
    boolean isDescriptionUnchanged =
        (description == null || description.equals(shelf.getDescription()));

    if (isNameUnchanged && isDescriptionUnchanged) {
      return shelf;
    }

    shelf.setName(trimmedName);
    if (description != null) {
      shelf.setDescription(description.isBlank() ? null : description.trim());
    }

    return shelfRepository.save(shelf);
  }

  @Override
  @Transactional
  @Caching(
      evict = {
        @CacheEvict(value = "shelf-list", key = "#userId"),
        @CacheEvict(value = "shelf", key = "#shelfId"),
        @CacheEvict(value = "shelf-items-list", key = "#shelfId")
      })
  public void deleteShelf(Long userId, Long shelfId) {
    shelfRepository
        .findByIdAndUserId(shelfId, userId)
        .orElseThrow(() -> new ShelfBusinessException("Estante não encontrada"));
    shelfRepository.softDelete(shelfId, userId);
    shelfItemRepository.softDeleteByShelfId(shelfId);
  }

  @Override
  @Transactional
  @CacheEvict(value = "shelf-items-list", key = "#shelfId")
  public ShelfItem addShelfItem(
      Long userId, Long shelfId, Long bookId, ReadingStatus initialStatus) {
    verifyShelfOwnership(shelfId, userId);

    if (shelfItemRepository.existsByShelfIdAndBookId(shelfId, bookId)) {
      throw new ShelfBusinessException("O livro já está nesta estante.");
    }

    Book book = bookUseCase.getById(bookId);

    ShelfItem item =
        ShelfItem.builder()
            .shelfId(shelfId)
            .bookId(bookId)
            .status(initialStatus != null ? initialStatus : ReadingStatus.WANT_TO_READ)
            .totalPages(book.getPageCount() != null ? book.getPageCount() : 0)
            .build();

    return shelfItemRepository.save(item);
  }

  @Override
  @Transactional
  @CacheEvict(value = "shelf-items-list", key = "#shelfId")
  public void removeShelfItem(Long userId, Long shelfId, Long itemId) {
    verifyShelfOwnership(shelfId, userId);

    ShelfItem item =
        shelfItemRepository
            .findByIdAndShelfId(itemId, shelfId)
            .orElseThrow(() -> new ShelfBusinessException("Item não encontrado na estante."));

    shelfItemRepository.softDelete(item.getId());
  }

  private ShelfItem resolveOwnedItemById(Long userId, Long shelfId, Long itemId) {
    verifyShelfOwnership(shelfId, userId);
    return shelfItemRepository
        .findByIdAndShelfId(itemId, shelfId)
        .orElseThrow(() -> new ShelfBusinessException("Item não encontrado na estante."));
  }

  @Override
  @Transactional
  @Caching(
      put = {@CachePut(value = "shelf-item", key = "#itemId")},
      evict = {@CacheEvict(value = "shelf-items-list", key = "#shelfId")})
  public ShelfItem updateItemProgress(Long userId, Long shelfId, Long itemId, Integer page) {
    ShelfItem item = resolveOwnedItemById(userId, shelfId, itemId);

    if (item.getStatus() != ReadingStatus.READING && item.getStatus() != ReadingStatus.REREADING) {
      throw new ShelfBusinessException(
          "Só é possível atualizar o progresso de um livro que está sendo lido.");
    }

    int max =
        (item.getTotalPages() != null && item.getTotalPages() > 0)
            ? item.getTotalPages()
            : Integer.MAX_VALUE;
    if (page < 0 || page > max) {
      throw new ShelfBusinessException("Página inválida. A página atual deve ser entre 0 e " + max);
    }

    item.setCurrentPage(page);

    if (max < Integer.MAX_VALUE && page == max) {
      item.setStatus(ReadingStatus.COMPLETED);
      item.setFinishedAt(LocalDate.now());
      item.setProgressPercent(100);
    } else if (max < Integer.MAX_VALUE) {
      item.setProgressPercent((page * 100) / max);
    }

    return shelfItemRepository.save(item);
  }

  @Override
  @Transactional
  @Caching(
      put = {@CachePut(value = "shelf-item", key = "#itemId")},
      evict = {@CacheEvict(value = "shelf-items-list", key = "#shelfId")})
  public ShelfItem changeItemStatus(
      Long userId, Long shelfId, Long itemId, ReadingStatus newStatus) {
    ShelfItem item = resolveOwnedItemById(userId, shelfId, itemId);

    if (item.getStatus() == newStatus) {
      return item;
    }

    switch (newStatus) {
      case READING, REREADING -> {
        item.setStatus(newStatus);
        item.setStartedAt(LocalDate.now());
        item.setFinishedAt(null);
        item.setRating(null);
        item.setReviewText(null);
      }
      case COMPLETED -> {
        item.setStatus(ReadingStatus.COMPLETED);
        item.setFinishedAt(LocalDate.now());
        if (item.getTotalPages() != null && item.getTotalPages() > 0) {
          item.setCurrentPage(item.getTotalPages());
          item.setProgressPercent(100);
        }
      }
      case ABANDONED -> {
        item.setStatus(ReadingStatus.ABANDONED);
        item.setFinishedAt(null);
        item.setCurrentPage(0);
        item.setProgressPercent(0);
      }
      case WANT_TO_READ ->
          throw new ShelfBusinessException(
              "Não é permitido retroceder um status para WANT_TO_READ.");
    }

    return shelfItemRepository.save(item);
  }

  @Override
  @Transactional
  public void reviewItem(
      Long userId,
      Long shelfId,
      Long itemId,
      Integer rating,
      String reviewText,
      List<byte[]> reviewImages) {
    ShelfItem item = resolveOwnedItemById(userId, shelfId, itemId);

    if (item.getStatus() != ReadingStatus.COMPLETED) {
      throw new ShelfBusinessException("Avaliação só é permitida quando o status for COMPLETED.");
    }

    if (rating == null || rating < 1 || rating > 5) {
      throw new ShelfBusinessException("Avaliação inválida. Deve ser entre 1 e 5.");
    }

    item.setRating(rating);
    item.setReviewText(reviewText);

    if (reviewImages != null && !reviewImages.isEmpty()) {
      List<String> imageUrls = new ArrayList<>();
      for (byte[] imageBytes : reviewImages) {
        String imageId = UUID.randomUUID().toString();
        String url =
            reviewImagePort.uploadReviewImage(imageBytes, itemId.toString(), imageId).join();
        imageUrls.add(url);
      }
      item.setReviewImageUrls(imageUrls);
    }

    shelfItemRepository.save(item);
  }

  @Override
  @Transactional
  public void deleteReview(Long userId, Long shelfId, Long itemId) {
    ShelfItem item = resolveOwnedItemById(userId, shelfId, itemId);

    List<String> imageUrls = item.getReviewImageUrls();
    if (imageUrls != null && !imageUrls.isEmpty()) {
      List<String> urlsToDelete = new ArrayList<>(imageUrls);
      reviewImagePort.deleteReviewImages(urlsToDelete);
    }

    item.setRating(null);
    item.setReviewText(null);
    item.setReviewImageUrls(new ArrayList<>());

    shelfItemRepository.save(item);
  }

  private void verifyShelfOwnership(Long shelfId, Long userId) {
    if (!shelfRepository.existsByIdAndUserId(shelfId, userId)) {
      throw new ShelfBusinessException(
          "Estante não encontrada ou você não tem permissão para acessá-la.");
    }
  }

  private ShelfItem resolveOwnedItem(Long userId, Long shelfId, Long bookId) {
    verifyShelfOwnership(shelfId, userId);
    return shelfItemRepository
        .findByShelfIdAndBookId(shelfId, bookId)
        .orElseThrow(() -> new ShelfBusinessException("O livro não está nesta estante."));
  }

  private void validateName(String name) {
    if (name == null || name.trim().isBlank()) {
      throw new ShelfBusinessException("O nome da estante é obrigatório e não pode ser vazio.");
    }
  }

  @Override
  @Transactional(readOnly = true)
  @Cacheable(value = "shelf-items-list", key = "#shelfId")
  public List<ShelfItem> listShelfItems(Long userId, Long shelfId) {
    verifyShelfOwnership(shelfId, userId);
    return shelfItemRepository.findAllByShelfId(shelfId);
  }

  @Override
  @Transactional(readOnly = true)
  @Cacheable(value = "shelf-item", key = "#itemId")
  public ShelfItem getShelfItemById(Long userId, Long shelfId, Long itemId) {
    return resolveOwnedItemById(userId, shelfId, itemId);
  }

  @Override
  @Transactional(readOnly = true)
  public ShelfItem getShelfItem(Long userId, Long shelfId, Long bookId) {
    return resolveOwnedItem(userId, shelfId, bookId);
  }
}
