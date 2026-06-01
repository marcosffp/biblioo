package com.biblioo.dna.infrastructure.dto.mapper;

import com.biblioo.dna.domain.model.LiteraryDna;
import com.biblioo.dna.infrastructure.dto.DnaProgressResponse;
import com.biblioo.dna.infrastructure.dto.DnaResponse;
import com.biblioo.dna.infrastructure.dto.ThemeEntryDto;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class DnaMapper {

  private final ObjectMapper objectMapper;

public DnaResponse toResponse(LiteraryDna dna) {
    return new DnaResponse(
        dna.getUserId(),
        dna.getStatus().name(),
        dna.getBooksReadCount(),
        dna.getComplexityScore(),
        dna.getComplexityLabel(),
        dna.getAvgDaysPerBook(),
        dna.getRereadRate(),
        dna.getRereadCount(),
        dna.getAbandonedCount(),
        fromJson(dna.getCentralThemesJson(), new TypeReference<List<ThemeEntryDto>>() {}),
        dna.getDominantArchetype() != null ? dna.getDominantArchetype().name() : null,
        dna.getDominantArchetype() != null ? dna.getDominantArchetype().getLabel() : null,
        fromJson(dna.getSecondaryArchetypesJson(), new TypeReference<List<String>>() {}),
        dna.getMostAbandonedGenre(),
        dna.getAvgTimePerBookDays(),
        dna.getTotalPagesRead(),                                                          // ← novo
        fromJson(dna.getPagesByYearJson(), new TypeReference<Map<Integer, Integer>>() {}), // ← novo
        dna.getCalculatedAt());
}

  public DnaProgressResponse toProgressResponse(LiteraryDna dna) {
    return DnaProgressResponse.of(dna.getBooksReadCount() != null ? dna.getBooksReadCount() : 0);
  }





  private <T> T fromJson(String json, TypeReference<T> type) {
    if (json == null || json.isBlank()) return null;
    try {
      return objectMapper.readValue(json, type);
    } catch (JsonProcessingException e) {
      log.error("[DnaMapper] Erro ao desserializar JSON: {}", e.getMessage());
      return null;
    }
  }
}
