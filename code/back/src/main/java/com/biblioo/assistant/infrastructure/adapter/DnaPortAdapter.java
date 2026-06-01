package com.biblioo.assistant.infrastructure.adapter;

import com.biblioo.assistant.domain.model.UserDnaProfile;
import com.biblioo.assistant.domain.port.out.AssistantDnaPort;
import com.biblioo.dna.domain.model.LiteraryDna;
import com.biblioo.dna.domain.port.in.LiteraryDnaUseCase;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
class DnaPortAdapter implements AssistantDnaPort {

  private static final TypeReference<List<String>> STRING_LIST = new TypeReference<>() {};

  private final LiteraryDnaUseCase literaryDnaUseCase;
  private final ObjectMapper objectMapper;

  @Override
  public UserDnaProfile getProfile(Long userId) {
    LiteraryDna dna = literaryDnaUseCase.getDna(userId);
    return new UserDnaProfile(
        dna.getStatus().name(),
        dna.getBooksReadCount() != null ? dna.getBooksReadCount() : 0,
        dna.getDominantArchetype() != null ? dna.getDominantArchetype().getLabel() : null,
        parseJsonList(dna.getSecondaryArchetypesJson()),
        parseJsonList(dna.getCentralThemesJson()),
        dna.getComplexityLabel(),
        dna.getMostAbandonedGenre());
  }

  private List<String> parseJsonList(String json) {
    if (json == null || json.isBlank()) return List.of();
    try {
      return objectMapper.readValue(json, STRING_LIST);
    } catch (Exception e) {
      log.warn("Falha ao desserializar campo JSON do DNA: {}", e.getMessage());
      return List.of();
    }
  }
}
