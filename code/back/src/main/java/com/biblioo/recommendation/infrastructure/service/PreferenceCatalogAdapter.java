package com.biblioo.recommendation.infrastructure.service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.Collection;
import java.util.List;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class PreferenceCatalogAdapter {

  @PersistenceContext private EntityManager entityManager;

  @SuppressWarnings("unchecked")
  @Transactional(readOnly = true)
  public List<String> findExistingGenreNames(Collection<String> names) {
    if (names == null || names.isEmpty()) return List.of();
    return entityManager
        .createNativeQuery("SELECT name FROM categories WHERE name IN (:names)")
        .setParameter("names", names)
        .getResultList();
  }

  @SuppressWarnings("unchecked")
  @Transactional(readOnly = true)
  public List<Long> findExistingBookIds(Collection<Long> ids) {
    if (ids == null || ids.isEmpty()) return List.of();
    return ((List<Object>)
            entityManager
                .createNativeQuery("SELECT id FROM books WHERE id IN (:ids)")
                .setParameter("ids", ids)
                .getResultList())
        .stream().map(r -> ((Number) r).longValue()).toList();
  }
}
