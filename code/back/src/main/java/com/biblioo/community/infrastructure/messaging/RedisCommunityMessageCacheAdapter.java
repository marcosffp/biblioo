package com.biblioo.community.infrastructure.messaging;

import com.biblioo.community.domain.model.CommunityMessage;
import com.biblioo.community.domain.port.out.MessageCachePort;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class RedisCommunityMessageCacheAdapter implements MessageCachePort {

  private static final String KEY_PREFIX = "community:messages:";
  private static final int MAX_CACHED = 100;
  private static final Duration TTL = Duration.ofHours(1);

  private final StringRedisTemplate stringRedisTemplate;
  private final ObjectMapper objectMapper;

  @Override
  public void pushMessage(Long communityId, CommunityMessage message) {
    String key = key(communityId);
    try {
      String json = objectMapper.writeValueAsString(message);
      stringRedisTemplate.opsForList().leftPush(key, json);
      stringRedisTemplate.opsForList().trim(key, 0, MAX_CACHED - 1);
      stringRedisTemplate.expire(key, TTL);
    } catch (JsonProcessingException e) {
      log.warn("Falha ao serializar mensagem para cache Redis: {}", e.getMessage());
    }
  }

  @Override
  public List<CommunityMessage> getRecentMessages(Long communityId) {
    String key = key(communityId);
    List<String> jsons = stringRedisTemplate.opsForList().range(key, 0, MAX_CACHED - 1);
    if (jsons == null || jsons.isEmpty()) {
      return List.of();
    }

    List<CommunityMessage> messages = new ArrayList<>(jsons.size());
    for (String json : jsons) {
      try {
        messages.add(objectMapper.readValue(json, CommunityMessage.class));
      } catch (JsonProcessingException e) {
        log.warn("Falha ao desserializar mensagem do cache Redis: {}", e.getMessage());
      }
    }
    return messages;
  }

  @Override
  public void invalidate(Long communityId) {
    stringRedisTemplate.delete(key(communityId));
  }

  private String key(Long communityId) {
    return KEY_PREFIX + communityId;
  }
}
