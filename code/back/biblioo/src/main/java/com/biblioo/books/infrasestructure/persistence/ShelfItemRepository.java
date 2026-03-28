package com.biblioo.books.infrasestructure.persistence;

import com.biblioo.books.domain.model.ReadingStatus;
import com.biblioo.books.domain.model.ShelfItem;
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

  @Modifying
  @Query("""
      UPDATE ShelfItem si
      SET si.currentPage    = :currentPage,
          si.updatedAt      = CURRENT_TIMESTAMP
      WHERE si.shelfId = :shelfId
        AND si.bookId  = :bookId
        AND si.deletedAt IS NULL
      """)
  int updateProgress(@Param("shelfId") Long shelfId,
      @Param("bookId") Long bookId,
      @Param("currentPage") Integer currentPage);

  @Modifying
  @Query("""
      UPDATE ShelfItem si
      SET si.deletedAt = CURRENT_TIMESTAMP
      WHERE si.shelfId   = :shelfId
        AND si.deletedAt IS NULL
      """)
  int softDeleteByShelfId(@Param("shelfId") Long shelfId);

  @Modifying
  @Query("""
      UPDATE ShelfItem si
      SET si.deletedAt = CURRENT_TIMESTAMP
      WHERE si.shelfId   = :shelfId
        AND si.bookId    = :bookId
        AND si.deletedAt IS NULL
      """)
  int softDeleteByShelfIdAndBookId(@Param("shelfId") Long shelfId,
      @Param("bookId") Long bookId);

}