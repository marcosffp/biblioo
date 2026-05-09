package com.biblioo.assistant.infrastructure.cache;

import com.biblioo.assistant.domain.model.ConversationTurn;
import com.biblioo.assistant.domain.port.out.ConversationHistoryPort;
import com.biblioo.assistant.infrastructure.config.AssistantProperties;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Duration;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
class RedisConversationHistoryAdapter implements ConversationHistoryPort {

  private static final String KEY_PREFIX = "assistant:conv:";
  private static final TypeReference<List<ConversationTurn>> LIST_TYPE = new TypeReference<>() {};

  private final StringRedisTemplate redisTemplate;
  private final ObjectMapper objectMapper;
  private final AssistantProperties props;

  @Override
  public List<ConversationTurn> load(String conversationId) {
    String json = redisTemplate.opsForValue().get(KEY_PREFIX + conversationId);
    if (json == null) {
      return List.of();
    }
    try {
      return objectMapper.readValue(json, LIST_TYPE);
    } catch (Exception e) {
      log.warn("Falha ao desserializar histórico do Redis: {}", e.getMessage());
      return List.of();
    }
  }

  @Override
  public void save(String conversationId, List<ConversationTurn> turns) {
    try {
      String json = objectMapper.writeValueAsString(turns);
      redisTemplate
          .opsForValue()
          .set(
              KEY_PREFIX + conversationId,
              json,
              Duration.ofMinutes(props.conversationTtlMinutes()));
    } catch (Exception e) {
      log.error("Falha ao salvar histórico no Redis: {}", e.getMessage());
    }
  }
}
