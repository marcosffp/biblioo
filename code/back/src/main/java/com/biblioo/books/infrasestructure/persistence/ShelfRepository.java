package com.biblioo.books.infrasestructure.persistence;

import com.biblioo.books.domain.model.Shelf;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ShelfRepository extends JpaRepository<Shelf, Long> {

  List<Shelf> findAllByUserId(Long userId);

  Optional<Shelf> findByIdAndUserId(Long id, Long userId);

  boolean existsByIdAndUserId(Long id, Long userId);

  @Query(
      """
      SELECT s FROM Shelf s
      WHERE s.id IN :ids
        AND s.userId = :userId
      """)
  List<Shelf> findAllByIdsAndUserId(@Param("ids") List<Long> ids, @Param("userId") Long userId);

  boolean existsByUserIdAndName(Long userId, String name);

  @Query(
      """
      SELECT COUNT(s) > 0 FROM Shelf s
      WHERE s.userId = :userId
        AND s.name   = :name
        AND s.id    <> :excludeId
      """)
  boolean existsByUserIdAndNameExcludingId(
      @Param("userId") Long userId, @Param("name") String name, @Param("excludeId") Long excludeId);

  @Modifying
  @Query(
      """
      UPDATE Shelf s
      SET s.deletedAt = CURRENT_TIMESTAMP
      WHERE s.id = :id
        AND s.userId = :userId
        AND s.deletedAt IS NULL
      """)
  int softDelete(@Param("id") Long id, @Param("userId") Long userId);
}
