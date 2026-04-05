package com.biblioo.books.infrasestructure.persistence;

import com.biblioo.books.domain.model.Category;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

  Optional<Category> findByName(String name);

  List<Category> findByNameIn(List<String> names);
}
