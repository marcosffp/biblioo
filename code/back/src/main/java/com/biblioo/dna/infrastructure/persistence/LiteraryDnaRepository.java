package com.biblioo.dna.infrastructure.persistence;

import com.biblioo.dna.domain.model.LiteraryDna;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LiteraryDnaRepository extends JpaRepository<LiteraryDna, Long> {

  Optional<LiteraryDna> findByUserId(Long userId);

  boolean existsByUserId(Long userId);
}
