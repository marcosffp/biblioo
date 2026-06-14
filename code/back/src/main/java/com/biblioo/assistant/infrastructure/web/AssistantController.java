package com.biblioo.assistant.infrastructure.web;

import com.biblioo.assistant.domain.exception.AssistantRateLimitException;
import com.biblioo.assistant.domain.port.in.AssistantUseCase;
import com.biblioo.assistant.infrastructure.config.AssistantProperties;
import com.biblioo.assistant.infrastructure.web.dto.ChatRequest;
import com.biblioo.assistant.infrastructure.web.dto.ChatResponse;
import com.biblioo.assistant.infrastructure.web.dto.ConversationSummaryResponse;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.time.Duration;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/assistant")
@RequiredArgsConstructor
@Tag(name = "Assistant", description = "Assistente literário Bibo — comandos em linguagem natural")
public class AssistantController {

  private final AssistantUseCase assistantUseCase;
  private final AssistantProperties props;
  private final ConcurrentHashMap<Long, Bucket> rateBuckets = new ConcurrentHashMap<>();

  @PostMapping("/chat")
  @Operation(
      summary = "Enviar mensagem ao Bibo",
      description =
          "Envia uma mensagem ao assistente Bibo. Inclua conversationId para manter contexto"
              + " entre turnos.")
  public ResponseEntity<ChatResponse> chat(
      @AuthenticationPrincipal UserDetails principal, @Valid @RequestBody ChatRequest request) {

    Long userId = Long.parseLong(principal.getUsername());
    checkRateLimit(userId);

    String sanitized = Jsoup.clean(request.message(), Safelist.none()).trim();
    if (sanitized.isBlank()) {
      return ResponseEntity.badRequest().build();
    }
    if (sanitized.length() > props.maxInputChars()) {
      sanitized = sanitized.substring(0, props.maxInputChars());
    }

    var response = assistantUseCase.chat(userId, sanitized, request.conversationId());
    return ResponseEntity.ok(new ChatResponse(response.reply(), response.conversationId()));
  }

  @GetMapping("/conversations")
  @Operation(
      summary = "Listar conversas",
      description = "Retorna todas as conversas do usuário ordenadas pela mais recente.")
  public ResponseEntity<List<ConversationSummaryResponse>> listConversations(
      @AuthenticationPrincipal UserDetails principal) {
    Long userId = Long.parseLong(principal.getUsername());
    List<ConversationSummaryResponse> result =
        assistantUseCase.listConversations(userId).stream()
            .map(
                s ->
                    new ConversationSummaryResponse(
                        s.id(), s.title(), s.createdAt(), s.updatedAt()))
            .toList();
    return ResponseEntity.ok(result);
  }

  private void checkRateLimit(Long userId) {
    Bucket bucket =
        rateBuckets.computeIfAbsent(
            userId,
            id ->
                Bucket.builder()
                    .addLimit(
                        Bandwidth.builder()
                            .capacity(props.rateLimitPerMinutePerUser())
                            .refillIntervally(
                                props.rateLimitPerMinutePerUser(), Duration.ofMinutes(1))
                            .build())
                    .build());
    if (!bucket.tryConsume(1)) {
      log.warn("Rate limit do assistente atingido");
      throw new AssistantRateLimitException(
          "Limite de requisições ao assistente atingido. Tente novamente em instantes.");
    }
  }
}
