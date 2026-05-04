package com.biblioo.books.infrasestructure.persistence;

import com.biblioo.books.domain.model.ReadingStatus;
import com.biblioo.books.domain.model.ShelfItem;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ShelfItemRepository extends JpaRepository<ShelfItem, Long> {

  Optional<ShelfItem> findByIdAndShelfId(Long itemId, Long shelfId);

  Optional<ShelfItem> findByShelfIdAndBookId(Long shelfId, Long bookId);

  List<ShelfItem> findAllByShelfId(Long shelfId);

  List<ShelfItem> findAllByShelfIdAndStatus(Long shelfId, ReadingStatus status);

  boolean existsByShelfIdAndBookId(Long shelfId, Long bookId);

  // Bypasses @SQLRestriction to find any row (including soft-deleted)
  @Query(
      value = "SELECT * FROM shelf_items WHERE shelf_id = :shelfId AND book_id = :bookId LIMIT 1",
      nativeQuery = true)
  Optional<ShelfItem> findByShelfIdAndBookIdIncludingDeleted(
      @Param("shelfId") Long shelfId, @Param("bookId") Long bookId);

  @Modifying
  @Query(
      """
      UPDATE ShelfItem si
      SET si.currentPage    = :currentPage,
          si.updatedAt      = CURRENT_TIMESTAMP
      WHERE si.shelfId = :shelfId
        AND si.bookId  = :bookId
        AND si.deletedAt IS NULL
      """)
  int updateProgress(
      @Param("shelfId") Long shelfId,
      @Param("bookId") Long bookId,
      @Param("currentPage") Integer currentPage);

  @Modifying
  @Query(
      """
      UPDATE ShelfItem si
      SET si.deletedAt = CURRENT_TIMESTAMP
      WHERE si.shelfId   = :shelfId
        AND si.deletedAt IS NULL
      """)
  int softDeleteByShelfId(@Param("shelfId") Long shelfId);

  @Modifying
  @Query(
      """
      UPDATE ShelfItem si
      SET si.deletedAt = CURRENT_TIMESTAMP
      WHERE si.shelfId   = :shelfId
        AND si.bookId    = :bookId
        AND si.deletedAt IS NULL
      """)
  int softDeleteByShelfIdAndBookId(@Param("shelfId") Long shelfId, @Param("bookId") Long bookId);

  @Modifying
  @Query(
      """
      UPDATE ShelfItem si
      SET si.deletedAt = CURRENT_TIMESTAMP
      WHERE si.id = :id
        AND si.deletedAt IS NULL
      """)
  int softDelete(@Param("id") Long id);

  @Query("SELECT si FROM ShelfItem si WHERE si.shelfId IN :shelfIds")
  List<ShelfItem> findAllByShelfIdIn(@Param("shelfIds") List<Long> shelfIds);

  @Query(
      """
      SELECT COUNT(si) > 0
      FROM ShelfItem si
      JOIN Shelf s ON s.id = si.shelfId
      WHERE s.userId = :userId
        AND si.bookId = :bookId
        AND s.deletedAt IS NULL
        AND si.deletedAt IS NULL
      """)
  boolean existsActiveByUserIdAndBookId(
      @Param("userId") Long userId, @Param("bookId") Long bookId);

  @Query("SELECT COUNT(si) FROM ShelfItem si WHERE si.bookId = :bookId")
  long countByBookId(@Param("bookId") Long bookId);

  @Query(
      """
      SELECT si FROM ShelfItem si
      JOIN Shelf s ON s.id = si.shelfId
      WHERE s.userId    = :userId
        AND si.status   IN :statuses
        AND s.deletedAt IS NULL
      """)
  List<ShelfItem> findByUserIdAndStatusIn(
      @Param("userId") Long userId, @Param("statuses") Collection<ReadingStatus> statuses);
}
