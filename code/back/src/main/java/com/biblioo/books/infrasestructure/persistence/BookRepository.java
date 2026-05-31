package com.biblioo.books.infrasestructure.persistence;

import com.biblioo.books.domain.model.Book;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {

  Optional<Book> findByIsbn(String isbn);

  List<Book> findByIsbnIn(List<String> isbns);

  boolean existsByIsbn(String isbn);

  @Query("SELECT b.isbn FROM Book b WHERE b.isbn IN :isbns")
  Set<String> findExistingIsbns(@Param("isbns") List<String> isbns);

  @Query(
      value = "SELECT * FROM books WHERE search_text LIKE CONCAT('%', :term, '%') LIMIT 20",
      nativeQuery = true)
  List<Book> searchByTerm(@Param("term") String term);

  @Query(
      """
            SELECT b FROM Book b
            WHERE b.averageRating >= :minRating
            ORDER BY b.averageRating DESC NULLS LAST, b.ratingCount DESC NULLS LAST
            """)
  List<Book> findTopRated(@Param("minRating") Float minRating);

  @Query("SELECT b.id FROM Book b")
  List<Long> findAllIds();

  @Modifying
  @Query("UPDATE Book b SET b.readerCount = :readerCount WHERE b.id = :bookId")
  void updateReaderCount(@Param("bookId") Long bookId, @Param("readerCount") long readerCount);

  @Modifying
  @Query(
      "UPDATE Book b SET b.averageRating = :avgRating, b.ratingCount = :ratingCount WHERE b.id = :bookId")
  void updateRatingStats(
      @Param("bookId") Long bookId,
      @Param("avgRating") Float avgRating,
      @Param("ratingCount") long ratingCount);
}
