package com.biblioo.dna.domain.port.in;

import com.biblioo.dna.domain.model.LiteraryDna;

public interface LiteraryDnaUseCase {

  LiteraryDna getDna(Long userId);

  void triggerRecalculation(Long userId);
}
