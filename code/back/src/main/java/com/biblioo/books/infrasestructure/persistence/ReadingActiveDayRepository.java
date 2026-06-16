package com.biblioo.books.infrasestructure.persistence;

import com.biblioo.books.domain.model.ReadingActiveDay;
import java.time.LocalDate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface ReadingActiveDayRepository extends JpaRepository<ReadingActiveDay, Long> {

  @Transactional
  @Modifying
  @Query(
      value =
          "INSERT IGNORE INTO reading_active_days (user_id, book_id, active_date) VALUES (:userId, :bookId, :activeDate)",
      nativeQuery = true)
  void insertOrIgnore(
      @Param("userId") Long userId,
      @Param("bookId") Long bookId,
      @Param("activeDate") LocalDate activeDate);

  @Query("SELECT COUNT(r) FROM ReadingActiveDay r WHERE r.userId = :userId")
  long countByUserId(@Param("userId") Long userId);
}
