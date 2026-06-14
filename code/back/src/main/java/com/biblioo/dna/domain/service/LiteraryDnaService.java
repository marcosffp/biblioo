package com.biblioo.dna.domain.service;

import com.biblioo.books.domain.port.in.ReadingHistoryUseCase;
import com.biblioo.dna.domain.model.DnaStatus;
import com.biblioo.dna.domain.model.LiteraryArchetype;
import com.biblioo.dna.domain.model.LiteraryDna;
import com.biblioo.dna.domain.port.in.LiteraryDnaUseCase;
import com.biblioo.dna.domain.service.DnaCalculationService.DnaResult;
import com.biblioo.dna.infrastructure.persistence.LiteraryDnaRepository;
import com.biblioo.feed.domain.port.in.UserReviewsUseCase;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class LiteraryDnaService implements LiteraryDnaUseCase {

  private final LiteraryDnaRepository literaryDnaRepository;
  private final ReadingHistoryUseCase readingHistoryUseCase;
  private final UserReviewsUseCase userReviewsUseCase;
  private final DnaCalculationService calculationService;
  private final ObjectMapper objectMapper;

  @Override
  @Transactional(readOnly = true)
  public LiteraryDna getDna(Long userId) {
    return literaryDnaRepository
        .findByUserId(userId)
        .orElse(
            LiteraryDna.builder()
                .userId(userId)
                .status(DnaStatus.IN_FORMATION)
                .booksReadCount(0)
                .totalPagesRead(0)
                .build());
  }

  @Override
  @Transactional
  public void triggerRecalculation(Long userId) {
    var history = readingHistoryUseCase.getReadingHistory(userId);
    var reviews = userReviewsUseCase.getReviewsByUserId(userId);
    int completedCount = calculationService.countCompletedBooks(history);

    var dna =
        literaryDnaRepository
            .findByUserId(userId)
            .orElse(LiteraryDna.builder().userId(userId).build());

    if (!calculationService.hasSufficientData(history)) {
      dna.setStatus(DnaStatus.IN_FORMATION);
      dna.setBooksReadCount(completedCount);
      literaryDnaRepository.save(dna);
      return;
    }

    DnaResult result = calculationService.calculate(history, reviews);
    applyResult(dna, result);
    literaryDnaRepository.save(dna);
  }

  private void applyResult(LiteraryDna dna, DnaResult result) {
    dna.setStatus(DnaStatus.COMPUTED);
    dna.setBooksReadCount(result.booksReadCount());
    dna.setAbandonedCount(result.abandonedCount());
    dna.setComplexityScore(result.complexityScore());
    dna.setComplexityLabel(result.complexityLabel());
    dna.setAvgDaysPerBook(result.avgDaysPerBook());
    dna.setRereadRate(result.rereadRate());
    dna.setRereadCount(result.rereadCount());
    dna.setMostAbandonedGenre(result.mostAbandonedGenre());
    dna.setAvgTimePerBookDays(result.avgTimePerBookDays());
    dna.setDominantArchetype(result.dominantArchetype());
    dna.setCalculatedAt(LocalDateTime.now());
    dna.setCentralThemesJson(toJson(result.centralThemes()));
    dna.setSecondaryArchetypesJson(
        toJson(result.secondaryArchetypes().stream().map(LiteraryArchetype::name).toList()));
    dna.setTotalPagesRead(result.totalPagesRead());
    dna.setPagesByYearJson(toJson(result.pagesByYear()));
  }

  private String toJson(Object obj) {
    if (obj == null) return null;
    try {
      return objectMapper.writeValueAsString(obj);
    } catch (JsonProcessingException e) {
      log.error("[DNA] Erro ao serializar: {}", e.getMessage(), e);
      return null;
    }
  }
}
