package com.biblioo.books.infrasestructure.persistence;

import com.biblioo.books.domain.model.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CollectionRepository extends JpaRepository<Collection, Long> {

  @Query("SELECT DISTINCT c FROM Collection c LEFT JOIN FETCH c.shelves WHERE c.userId = :userId ORDER BY c.updatedAt DESC")
  List<Collection> findAllByUserIdOrderByUpdatedAtDesc(@Param("userId") Long userId);

  Optional<Collection> findByIdAndUserId(Long id, Long userId);

  @Query("""
      SELECT c FROM Collection c
      LEFT JOIN FETCH c.shelves
      WHERE c.id     = :id
        AND c.userId = :userId
      """)
  Optional<Collection> findByIdAndUserIdWithShelves(@Param("id") Long id,
      @Param("userId") Long userId);

  boolean existsByUserIdAndName(Long userId, String name);

  @Query("""
      SELECT COUNT(c) > 0 FROM Collection c
      WHERE c.userId = :userId
        AND c.name   = :name
        AND c.id    <> :excludeId
      """)
  boolean existsByUserIdAndNameExcludingId(@Param("userId") Long userId,
      @Param("name") String name,
      @Param("excludeId") Long excludeId);
}