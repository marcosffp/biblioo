package com.biblioo.recommendation.domain.service;

import com.biblioo.recommendation.domain.model.BookScore;
import com.biblioo.recommendation.domain.model.RecommendationResult;
import com.biblioo.recommendation.domain.model.RereadWorthItResult;
import com.biblioo.recommendation.infrastructure.persistence.RecommendationResultRepository;
import com.biblioo.recommendation.infrastructure.service.RereadWorthItComputeService;
import com.biblioo.recommendation.infrastructure.service.RereadWorthItComputeService.ReadingData;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class RereadWorthItService {

  private static final String TRAIL_TYPE = "REREAD_WORTH_IT";
  private static final String METADATA_KEY = "rereadCounts";

  private final RereadWorthItComputeService computeService;
  private final RecommendationResultRepository resultRepository;
  private final ObjectMapper objectMapper;

  @Value("${recommendation.reread-worth-it.candidate-limit:20}")
  private int candidateLimit;

  @Value("${recommendation.reread-worth-it.min-days-since-read:90}")
  private int minDaysSinceRead;

  /** Dias base de intervalo por ponto de avaliação (ex.: nota 5 → 5 × 30 = 150 dias). */
  @Value("${recommendation.reread-worth-it.interval-base-multiplier-days:30}")
  private int intervalBaseMultiplierDays;

  /** Fator multiplicador do intervalo a cada releitura confirmada. */
  @Value("${recommendation.reread-worth-it.reread-interval-factor:1.5}")
  private double rereadIntervalFactor;

  /**
   * Computa e persiste recomendações de releitura para o usuário.
   * Chamado pelo consumer a cada livro concluído e pelo inicializador no startup/cadastro.
   *
   * <p>O reread_count é mantido no metadata da linha em recommendation_results porque a tabela
   * shelf_items tem constraint única (shelf_id, book_id) — não é possível contar conclusões
   * múltiplas por contagem de linhas. A cada chamada, livros com finished_at posterior ao último
   * computed_at têm seu contador incrementado.
   */
  public void compute(Long userId) {
    log.info("[RWI] Computando trilho RereadWorthIt para userId={}", userId);

    Optional<RecommendationResult> previous = resultRepository.findResultEntity(userId, TRAIL_TYPE);
    Map<Long, Integer> rereadCounts = readRereadCounts(previous);
    LocalDate lastComputedDate = previous.map(r -> r.getComputedAt().toLocalDate()).orElse(null);

    List<ReadingData> readings = computeService.getEligibleReadings(userId, minDaysSinceRead);

    if (lastComputedDate != null) {
      for (ReadingData r : readings) {
        if (r.finishedAt().isAfter(lastComputedDate)) {
          rereadCounts.merge(r.bookId(), 1, Integer::sum);
          log.info("[RWI] Releitura detectada bookId={} userId={} count={}", r.bookId(), userId, rereadCounts.get(r.bookId()));
        }
      }
    }

    List<BookScore> candidates = computeScores(readings, rereadCounts);

    if (candidates.isEmpty()) {
      log.info("[RWI] Nenhum candidato maduro para userId={}, aplicando fallback global", userId);
      candidates = computeService.computeFallback(userId, candidateLimit);
    }

    resultRepository.upsertWithRawMetadata(userId, TRAIL_TYPE, candidates, serializeRereadCounts(rereadCounts));

    log.info("[RWI] {} recomendações persistidas para userId={}", candidates.size(), userId);
  }

  /**
   * Retorna resultado pré-computado. Quando nenhum resultado existe (usuário nunca computado),
   * calcula e persiste o fallback global imediatamente para que chamadas subsequentes sejam rápidas.
   */
  public RereadWorthItResult get(Long userId) {
    Optional<RecommendationResult> stored = resultRepository.findResultEntity(userId, TRAIL_TYPE);

    if (stored.isPresent()) {
      List<BookScore> books = deserializeBooks(stored.get().getBooks());
      return new RereadWorthItResult(books);
    }

    log.info("[RWI] Sem resultado pré-computado para userId={}, calculando e persistindo fallback", userId);
    List<BookScore> fallback = computeService.computeFallback(userId, candidateLimit);
    resultRepository.upsertWithRawMetadata(userId, TRAIL_TYPE, fallback, "{}");

    return new RereadWorthItResult(fallback);
  }

  // --- privados ---

  private List<BookScore> computeScores(List<ReadingData> readings, Map<Long, Integer> rereadCounts) {
    return readings.stream()
        .map(r -> toBookScore(r, rereadCounts.getOrDefault(r.bookId(), 0)))
        .filter(bs -> bs.getScore() > 0)
        .sorted(Comparator.comparingDouble(BookScore::getScore).reversed())
        .limit(candidateLimit)
        .toList();
  }

  private BookScore toBookScore(ReadingData r, int rereadCount) {
    double intervalIdeal = r.userRating() * intervalBaseMultiplierDays
        * Math.pow(rereadIntervalFactor, rereadCount);

    if (r.daysSinceRead() < intervalIdeal) {
      return new BookScore(r.bookId(), 0.0, "within_interval");
    }

    double maturityScore = Math.min(1.0, (r.daysSinceRead() - intervalIdeal) / intervalIdeal);
    double finalScore = 0.7 * maturityScore + 0.3 * (r.userRating() / 5.0);

    return new BookScore(r.bookId(), finalScore, "spaced_repetition");
  }

  @SuppressWarnings("unchecked")
  private Map<Long, Integer> readRereadCounts(Optional<RecommendationResult> previous) {
    if (previous.isEmpty() || previous.get().getMetadata() == null) {
      return new HashMap<>();
    }
    try {
      Map<String, Object> meta = objectMapper.readValue(previous.get().getMetadata(),
          new TypeReference<Map<String, Object>>() {});
      Object raw = meta.get(METADATA_KEY);
      if (raw == null) return new HashMap<>();
      Map<String, Integer> counts = objectMapper.convertValue(raw,
          new TypeReference<Map<String, Integer>>() {});
      Map<Long, Integer> result = new HashMap<>();
      counts.forEach((k, v) -> result.put(Long.parseLong(k), v));
      return result;
    } catch (Exception ex) {
      log.warn("[RWI] Falha ao ler rereadCounts do metadata: {}", ex.getMessage());
      return new HashMap<>();
    }
  }

  private String serializeRereadCounts(Map<Long, Integer> rereadCounts) {
    try {
      return objectMapper.writeValueAsString(Map.of(METADATA_KEY, rereadCounts));
    } catch (Exception ex) {
      throw new RuntimeException("Falha ao serializar rereadCounts", ex);
    }
  }

  private List<BookScore> deserializeBooks(String json) {
    try {
      return objectMapper.readValue(json, new TypeReference<List<BookScore>>() {});
    } catch (Exception ex) {
      log.warn("[RWI] Falha ao desserializar books: {}", ex.getMessage());
      return List.of();
    }
  }
}
