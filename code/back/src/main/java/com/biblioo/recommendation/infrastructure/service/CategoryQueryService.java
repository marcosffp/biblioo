package com.biblioo.recommendation.infrastructure.service;

import com.biblioo.books.infrasestructure.persistence.CategoryRepository;
import java.util.Collection;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CategoryQueryService {

  private final CategoryRepository categoryRepository;

  @Transactional(readOnly = true)
  public List<String> findAllNames() {
    return categoryRepository.findAll().stream()
        .map(c -> c.getName())
        .filter(name -> name != null && !name.isBlank())
        .toList();
  }

  @Transactional(readOnly = true)
  public List<String> findExistingNames(Collection<String> names) {
    if (names == null || names.isEmpty()) return List.of();
    return categoryRepository.findByNameIn(List.copyOf(names)).stream()
        .map(c -> c.getName())
        .toList();
  }
}
