package com.biblioo.books.infrasestructure.persistence;

import com.biblioo.books.domain.model.Book;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {

  Optional<Book> findByIsbn(String isbn);

  List<Book> findByTitleContainingIgnoreCase(String title);

  List<Book> findByTitleContainingIgnoreCaseOrderByTitleAsc(String title);

  @Query("SELECT b.isbn FROM Book b WHERE b.isbn IN :isbns")
  Set<String> findAllByIsbn(@Param("isbns") List<String> isbns);
}
