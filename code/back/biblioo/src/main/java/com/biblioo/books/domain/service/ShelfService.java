package com.biblioo.books.domain.service;

import com.biblioo.books.domain.exception.ShelfBusinessException;
import com.biblioo.books.domain.model.Book;
import com.biblioo.books.domain.model.ReadingStatus;
import com.biblioo.books.domain.model.Shelf;
import com.biblioo.books.domain.model.ShelfItem;
import com.biblioo.books.domain.port.in.BookUseCase;
import com.biblioo.books.domain.port.in.ShelfUseCase;
import com.biblioo.books.infrasestructure.persistence.ShelfItemRepository;
import com.biblioo.books.infrasestructure.persistence.ShelfRepository;

import lombok.AllArgsConstructor;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@AllArgsConstructor
public class ShelfService implements ShelfUseCase {

    private final ShelfRepository shelfRepository;
    private final ShelfItemRepository shelfItemRepository;
    private final BookUseCase bookUseCase;

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
        return shelfRepository.findByIdAndUserId(shelfId, userId)
                .orElseThrow(() -> new ShelfBusinessException("Estante não encontrada"));
    }

    @Override
    @Transactional
    @CacheEvict(value = "shelf-list", key = "#userId")
    public Shelf createShelf(Long userId, String name, String description) {
        validateName(name);

        Shelf shelf = Shelf.builder()
                .userId(userId)
                .name(name.trim())
                .description(description)
                .build();

        return shelfRepository.save(shelf);
    }

    @Override
    @Transactional
    @Caching(
        evict = { @CacheEvict(value = "shelf-list", key = "#userId") },
        put = { @CachePut(value = "shelf", key = "#shelfId") }
    )
    public Shelf updateShelf(Long userId, Long shelfId, String name, String description) {
        Shelf shelf = shelfRepository.findByIdAndUserId(shelfId, userId)
                .orElseThrow(() -> new ShelfBusinessException("Estante não encontrada"));

        validateName(name);
        String trimmedName = name.trim();

        boolean isNameUnchanged = shelf.getName().equals(trimmedName);
        boolean isDescriptionUnchanged = (description == null || description.equals(shelf.getDescription()));

        if (isNameUnchanged && isDescriptionUnchanged) {
            return shelf;
        }

        shelf.setName(trimmedName);
        if (description != null) {
            shelf.setDescription(description);
        }

        return shelfRepository.save(shelf);
    }

    @Override
    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "shelf-list", key = "#userId"),
        @CacheEvict(value = "shelf", key = "#shelfId"),
        @CacheEvict(value = "shelf-items-list", key = "#shelfId")
    })
    public void deleteShelf(Long userId, Long shelfId) {
        shelfRepository.findByIdAndUserId(shelfId, userId)
                .orElseThrow(() -> new ShelfBusinessException("Estante não encontrada"));
        shelfRepository.softDelete(shelfId, userId);
        shelfItemRepository.softDeleteByShelfId(shelfId);
    }

    @Override
    @Transactional
    @CacheEvict(value = "shelf-items-list", key = "#shelfId")
    public ShelfItem addShelfItem(Long userId, Long shelfId, Long bookId,
            ReadingStatus initialStatus) {
        verifyShelfOwnership(shelfId, userId);

        if (shelfItemRepository.existsByShelfIdAndBookId(shelfId, bookId)) {
            throw new ShelfBusinessException("Este livro já está presente nesta estante.");
        }

        Book book = bookUseCase.getById(bookId);

        ShelfItem item = ShelfItem.builder()
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

        ShelfItem item = shelfItemRepository.findByIdAndShelfId(itemId, shelfId)
                .orElseThrow(() -> new ShelfBusinessException("Item não encontrado na estante."));

        int affected = shelfItemRepository.softDeleteByShelfIdAndBookId(shelfId, item.getBookId());
        if (affected == 0) {
            throw new ShelfBusinessException("Item não encontrado na estante.");
        }
    }

    private ShelfItem resolveOwnedItemById(Long userId, Long shelfId, Long itemId) {
        verifyShelfOwnership(shelfId, userId);
        return shelfItemRepository.findByIdAndShelfId(itemId, shelfId)
                .orElseThrow(() -> new ShelfBusinessException("Item não encontrado na estante."));
    }

    @Override
    @Transactional
    @Caching(
            put = { @CachePut(value = "shelf-item", key = "#itemId") },
            evict = { @CacheEvict(value = "shelf-items-list", key = "#shelfId") }
    )
    public ShelfItem updateItemProgress(Long userId, Long shelfId, Long itemId, Integer page) {
        ShelfItem item = resolveOwnedItemById(userId, shelfId, itemId);

        if (page < 0 || (item.getTotalPages() != null && page > item.getTotalPages())) {
            throw new ShelfBusinessException("Página atual inválida em relação ao total de páginas.");
        }

        ReadingStatus status = item.getStatus();
        if (status != ReadingStatus.READING && status != ReadingStatus.REREADING) {
            ReadingStatus newStatus = (status == ReadingStatus.COMPLETED) ? ReadingStatus.REREADING
                    : ReadingStatus.READING;
            item = changeItemStatus(userId, shelfId, itemId, newStatus);
        }

        int affected = shelfItemRepository.updateProgress(shelfId, item.getBookId(), page);
        if (affected == 0) {
            throw new ShelfBusinessException("Não foi possível atualizar o progresso do item.");
        }
        item.setCurrentPage(page);
        if (item.getTotalPages() != null && item.getTotalPages() > 0) {
            item.setProgressPercent((int) Math.round(((double) page / item.getTotalPages()) * 100));
        } else {
            item.setProgressPercent(0);
        }
        return item;
    }

    @Override
    @Transactional
    @Caching(
            put = { @CachePut(value = "shelf-item", key = "#itemId") },
            evict = { @CacheEvict(value = "shelf-items-list", key = "#shelfId") }
    )
    public ShelfItem changeItemStatus(Long userId, Long shelfId, Long itemId, ReadingStatus newStatus) {
        ShelfItem item = resolveOwnedItemById(userId, shelfId, itemId);

        ReadingStatus current = item.getStatus();
        if (current == newStatus)
            return item;

        switch (newStatus) {
            case READING -> {
                item.setStatus(ReadingStatus.READING);
                if (item.getStartedAt() == null) {
                    item.setStartedAt(LocalDate.now());
                }
                item.setFinishedAt(null);
            }
            case REREADING -> {
                item.setStatus(ReadingStatus.REREADING);
                item.setStartedAt(LocalDate.now());
                item.setFinishedAt(null);
                item.setCurrentPage(0);
                item.setProgressPercent(0);
            }
            case COMPLETED -> {
                item.setStatus(ReadingStatus.COMPLETED);
                if (item.getStartedAt() == null) {
                    item.setStartedAt(LocalDate.now());
                }
                item.setFinishedAt(LocalDate.now());
                item.setCurrentPage(item.getTotalPages() != null ? item.getTotalPages() : 0);
                item.setProgressPercent(item.getTotalPages() != null && item.getTotalPages() > 0 ? 100 : 0);
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
    public void reviewItem(Long userId, Long shelfId, Long itemId, Integer rating, String reviewText) {
        ShelfItem item = resolveOwnedItemById(userId, shelfId, itemId);

        if (item.getStatus() != ReadingStatus.COMPLETED) {
            throw new ShelfBusinessException("Avaliação só é permitida quando o status for COMPLETED.");
        }

        if (rating == null || rating < 1 || rating > 5) {
            throw new ShelfBusinessException("Avaliação inválida. Deve ser entre 1 e 5.");
        }

        item.setRating(rating);
        item.setReviewText(reviewText);

        shelfItemRepository.save(item);
        // Trigger no banco recalcula average_rating na tabela books após este save.
    }

    private void verifyShelfOwnership(Long shelfId, Long userId) {
        shelfRepository.findByIdAndUserId(shelfId, userId)
                .orElseThrow(() -> new ShelfBusinessException("Estante não encontrada"));
    }

    private ShelfItem resolveOwnedItem(Long userId, Long shelfId, Long bookId) {
        verifyShelfOwnership(shelfId, userId);
        return shelfItemRepository.findByShelfIdAndBookId(shelfId, bookId)
                .orElseThrow(() -> new ShelfBusinessException("Item não encontrado na estante."));
    }

    private void validateName(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new ShelfBusinessException("O nome da estante é obrigatório.");
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
        verifyShelfOwnership(shelfId, userId);
        return shelfItemRepository.findByIdAndShelfId(itemId, shelfId)
                .orElseThrow(() -> new ShelfBusinessException("Item não encontrado na estante."));
    }

    @Override
    @Transactional(readOnly = true)
    public ShelfItem getShelfItem(Long userId, Long shelfId, Long bookId) {
        return resolveOwnedItem(userId, shelfId, bookId);
    }

}