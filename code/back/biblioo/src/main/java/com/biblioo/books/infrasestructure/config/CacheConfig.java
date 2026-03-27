package com.biblioo.books.infrasestructure.config;

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
import org.springframework.data.redis.serializer.GenericJacksonJsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.retry.annotation.EnableRetry;
import org.springframework.retry.support.RetryTemplate;
import tools.jackson.databind.jsontype.BasicPolymorphicTypeValidator;

@Slf4j
@Configuration
@EnableCaching
@EnableRetry
public class CacheConfig implements CachingConfigurer {

  /**
   * CacheManager com TTL configurado por cache.
   *
   * <p>Serializer: GenericJacksonJsonRedisSerializer (Jackson 3). enableDefaultTyping grava o campo
   * "@class" no JSON para que o Jackson desserialize corretamente List<Book> e outros tipos
   * polimórficos.
   *
   * <p>- book-search (5 min) : resultado de buscas no OpenSearch/Google Books - book-suggest (10
   * min): autocomplete (muda pouco entre requisições) - google-books (10 min): evita chamadas
   * duplicadas à API externa
   */
  @Bean
  RedisCacheManager cacheManager(RedisConnectionFactory factory) {
    var typeValidator =
        BasicPolymorphicTypeValidator.builder().allowIfBaseType(Object.class).build();

    var serializer =
        GenericJacksonJsonRedisSerializer.builder()
            .enableDefaultTyping(typeValidator)
            .typePropertyName("@class")
            .build();

    var valuePair = RedisSerializationContext.SerializationPair.fromSerializer(serializer);

    var base =
        RedisCacheConfiguration.defaultCacheConfig()
            .prefixCacheNameWith("biblioo:")
            .disableCachingNullValues()
            .serializeValuesWith(valuePair);

    return RedisCacheManager.builder(factory)
        .cacheDefaults(base)
        .withCacheConfiguration("book-search", base.entryTtl(Duration.ofMinutes(5)))
        .withCacheConfiguration("book-suggest", base.entryTtl(Duration.ofMinutes(10)))
        .withCacheConfiguration("google-books", base.entryTtl(Duration.ofMinutes(10)))
        .build();
  }

  /**
   * Trata erros de cache de forma resiliente: - GET com desserialização corrompida → evicta a chave
   * e trata como cache miss - PUT/EVICT/CLEAR com Redis indisponível → loga e continua sem cache
   *
   * <p>Isso elimina a necessidade de bumpar manualmente versões de prefixo quando o formato de
   * serialização mudar.
   */
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

  /**
   * RetryTemplate para uso direto em métodos privados onde o proxy Spring não alcança (ex.:
   * GoogleBooksAdapter.fetchFromApi). 3 tentativas com backoff exponencial: 300ms → 600ms → 1200ms.
   */
  @Bean
  RetryTemplate retryTemplate() {
    return RetryTemplate.builder()
        .maxAttempts(3)
        .exponentialBackoff(300, 2, 3_000)
        .retryOn(Exception.class)
        .build();
  }
}
