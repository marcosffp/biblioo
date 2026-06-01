package com.biblioo.recommendation.infrastructure.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.retry.support.RetryTemplate;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class GenreTranslationService {

  private static final int MAX_BATCH_SIZE = 100;
  private static final int TRANSLATION_TIMEOUT_SECONDS = 8;

  private final ChatClient chatClient;
  private final ObjectMapper objectMapper;
  private final RetryTemplate retryTemplate;

  public GenreTranslationService(ChatClient.Builder chatClientBuilder, ObjectMapper objectMapper) {
    this.chatClient = chatClientBuilder.build();
    this.objectMapper = objectMapper;
    this.retryTemplate =
        RetryTemplate.builder().maxAttempts(1).retryOn(Exception.class).build();
  }

  public Map<String, String> translateBatch(List<String> genres) {
    if (genres == null || genres.isEmpty()) return Map.of();

    List<String> batch = genres.size() > MAX_BATCH_SIZE ? genres.subList(0, MAX_BATCH_SIZE) : genres;

    return retryTemplate.execute(
        ctx -> {
          log.info("[GenreTranslation] Traduzindo {} gêneros via Gemini", batch.size());
          String raw = CompletableFuture
              .supplyAsync(() -> chatClient.prompt().user(buildPrompt(batch)).call().content())
              .orTimeout(TRANSLATION_TIMEOUT_SECONDS, TimeUnit.SECONDS)
              .join();
          return parseResponse(raw, batch);
        },
        ctx -> {
          log.warn("[GenreTranslation] Gemini indisponível ({}). Retornando originais.",
              ctx.getLastThrowable() != null ? ctx.getLastThrowable().getMessage() : "timeout");
          return buildFallback(batch);
        });
  }

  private String buildPrompt(List<String> genres) {
    return """
        Translate these book genre names from English to Brazilian Portuguese (pt-BR).
        Return ONLY a valid JSON object where each key is the original English name and each value is the Portuguese translation.
        No markdown, no explanations, no code blocks — just the raw JSON object.

        Genres: %s
        """
        .formatted(genres.toString());
  }

  private Map<String, String> parseResponse(String response, List<String> genres) {
    try {
      String cleaned =
          response
              .strip()
              .replaceAll("(?s)^```(?:json)?\\s*", "")
              .replaceAll("\\s*```\\s*$", "");

      Map<String, String> parsed =
          objectMapper.readValue(cleaned, new TypeReference<LinkedHashMap<String, String>>() {});

      LinkedHashMap<String, String> result = new LinkedHashMap<>();
      for (String genre : genres) {
        String t = parsed.get(genre);
        result.put(genre, (t != null && !t.isBlank()) ? t : genre);
      }
      return result;
    } catch (Exception e) {
      log.warn("[GenreTranslation] Falha ao parsear JSON: {}. Usando fallback.", e.getMessage());
      return buildFallback(genres);
    }
  }

  private Map<String, String> buildFallback(List<String> genres) {
    LinkedHashMap<String, String> fallback = new LinkedHashMap<>();
    genres.forEach(g -> fallback.put(g, g));
    return fallback;
  }
}
