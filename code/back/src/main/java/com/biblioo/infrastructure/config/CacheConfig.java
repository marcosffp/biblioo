package com.biblioo.infrastructure.config;

import java.time.Duration;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.Cache;
import org.springframework.cache.annotation.CachingConfigurer;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.interceptor.CacheErrorHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJacksonJsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import org.springframework.retry.annotation.EnableRetry;
import org.springframework.retry.support.RetryTemplate;
import tools.jackson.databind.jsontype.BasicPolymorphicTypeValidator;

@Slf4j
@Configuration
@EnableCaching
@EnableRetry
public class CacheConfig implements CachingConfigurer {

  private GenericJacksonJsonRedisSerializer buildSerializer() {
    var typeValidator = BasicPolymorphicTypeValidator.builder().allowIfBaseType(Object.class).build();
    return GenericJacksonJsonRedisSerializer.builder()
        .enableDefaultTyping(typeValidator)
        .typePropertyName("@class")
        .build();
  }


  @Bean("bookCacheTemplate")
  RedisTemplate<String, Object> bookCacheTemplate(RedisConnectionFactory factory) {
    var template = new RedisTemplate<String, Object>();
    template.setConnectionFactory(factory);
    template.setKeySerializer(new StringRedisSerializer());
    template.setValueSerializer(buildSerializer());
    template.afterPropertiesSet();
    return template;
  }

  @Bean("shareCardRedisTemplate")
  RedisTemplate<String, byte[]> shareCardRedisTemplate(RedisConnectionFactory factory) {
    var template = new RedisTemplate<String, byte[]>();
    template.setConnectionFactory(factory);
    template.setKeySerializer(new StringRedisSerializer());
    template.setValueSerializer(new ByteArrayRedisSerializer());
    template.afterPropertiesSet();
    return template;
  }

  @Bean
  RedisCacheManager cacheManager(RedisConnectionFactory factory) {
    var serializer = buildSerializer();

    var valuePair = RedisSerializationContext.SerializationPair.fromSerializer(serializer);

    var base = RedisCacheConfiguration.defaultCacheConfig()
        .prefixCacheNameWith("biblioo:")
        .disableCachingNullValues()
        .serializeValuesWith(valuePair);

    return RedisCacheManager.builder(factory)
        .cacheDefaults(base)
        .withCacheConfiguration("book-search",  base.entryTtl(Duration.ofMinutes(5)))
        .withCacheConfiguration("book-detail",  base.entryTtl(Duration.ofHours(1)))
        .withCacheConfiguration("google-books", base.entryTtl(Duration.ofMinutes(10)))
        .withCacheConfiguration("user-profile", base.entryTtl(Duration.ofMinutes(10)))
        .withCacheConfiguration("shelf-list",       base.entryTtl(Duration.ofHours(1)))
        .withCacheConfiguration("shelf",            base.entryTtl(Duration.ofHours(1)))
        .withCacheConfiguration("shelf-items-list", base.entryTtl(Duration.ofHours(1)))
        .withCacheConfiguration("shelf-item",       base.entryTtl(Duration.ofHours(1)))
        .withCacheConfiguration("collection-list",   base.entryTtl(Duration.ofHours(1)))
        .withCacheConfiguration("collection-detail", base.entryTtl(Duration.ofHours(1)))
        .withCacheConfiguration("community-membership", base.entryTtl(Duration.ofMinutes(2)))
        .withCacheConfiguration("rec-byr", base.entryTtl(Duration.ofMinutes(5)))
        .withCacheConfiguration("rec-fgn", base.entryTtl(Duration.ofMinutes(5)))
        .withCacheConfiguration("rec-tic", base.entryTtl(Duration.ofMinutes(3)))
        .withCacheConfiguration("rec-cs",  base.entryTtl(Duration.ofMinutes(2)))
        .withCacheConfiguration("rec-sa",  base.entryTtl(Duration.ofMinutes(5)))
        .withCacheConfiguration("rec-rwi", base.entryTtl(Duration.ofMinutes(5)))
        .withCacheConfiguration("trending-communities", base.entryTtl(Duration.ofMinutes(15)))
        .withCacheConfiguration("trending-books",       base.entryTtl(Duration.ofMinutes(15)))
        .build();
  }

  @Override
  public CacheErrorHandler errorHandler() {
    return new CacheErrorHandler() {
      @Override
      public void handleCacheGetError(RuntimeException e, Cache cache, Object key) {
        log.warn(
            "Cache GET falhou para cache='{}' key='{}'. Evictando entrada corrompida e tratando como miss. Causa: {}",
            cache.getName(),
            key,
            e.getMessage());
        try {
          cache.evict(key);
        } catch (Exception evictEx) {
          log.warn(
              "Falha ao evictar chave corrompida cache='{}' key='{}'. Causa: {}",
              cache.getName(),
              key,
              evictEx.getMessage());
        }
      }

      @Override
      public void handleCachePutError(RuntimeException e, Cache cache, Object key, Object value) {
        log.warn(
            "Cache PUT falhou para cache='{}' key='{}'. Dado não será cacheado. Causa: {}",
            cache.getName(),
            key,
            e.getMessage());
      }

      @Override
      public void handleCacheEvictError(RuntimeException e, Cache cache, Object key) {
        log.warn(
            "Cache EVICT falhou para cache='{}' key='{}'. Causa: {}",
            cache.getName(),
            key,
            e.getMessage());
      }

      @Override
      public void handleCacheClearError(RuntimeException e, Cache cache) {
        log.warn("Cache CLEAR falhou para cache='{}'. Causa: {}", cache.getName(), e.getMessage());
      }
    };
  }

  @Bean("cacheRetryTemplate")
  RetryTemplate cacheRetryTemplate() {
    return RetryTemplate.builder()
        .maxAttempts(3)
        .exponentialBackoff(300, 2, 3_000)
        .retryOn(Exception.class)
        .build();
  }
}