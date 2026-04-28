package com.biblioo.recommendation.infrastructure.config;

import org.aopalliance.aop.Advice;
import org.springframework.amqp.rabbit.config.RetryInterceptorBuilder;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RecommendationListenerConfig {

  @Bean
  Advice becauseYouReadRetryInterceptor() {
    return RetryInterceptorBuilder.stateless()
        .maxRetries(3)
        .backOffOptions(2_000, 2.0, 10_000)
        .build();
  }

  @SuppressWarnings("removal")
  @Bean
  SimpleRabbitListenerContainerFactory becauseYouReadListenerFactory(
      ConnectionFactory connectionFactory,
      Jackson2JsonMessageConverter messageConverter,
      Advice becauseYouReadRetryInterceptor) {
    SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
    factory.setConnectionFactory(connectionFactory);
    factory.setMessageConverter(messageConverter);
    factory.setAdviceChain(becauseYouReadRetryInterceptor);
    factory.setDefaultRequeueRejected(false);
    return factory;
  }

  @Bean
  Advice favoriteGenreNowRetryInterceptor() {
    return RetryInterceptorBuilder.stateless()
        .maxRetries(3)
        .backOffOptions(2_000, 2.0, 10_000)
        .build();
  }

  @SuppressWarnings("removal")
  @Bean
  SimpleRabbitListenerContainerFactory favoriteGenreNowListenerFactory(
      ConnectionFactory connectionFactory,
      Jackson2JsonMessageConverter messageConverter,
      Advice favoriteGenreNowRetryInterceptor) {
    SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
    factory.setConnectionFactory(connectionFactory);
    factory.setMessageConverter(messageConverter);
    factory.setAdviceChain(favoriteGenreNowRetryInterceptor);
    factory.setDefaultRequeueRejected(false);
    return factory;
  }

  @Bean
  Advice trendingInCommunitiesRetryInterceptor() {
    return RetryInterceptorBuilder.stateless()
        .maxRetries(3)
        .backOffOptions(2_000, 2.0, 10_000)
        .build();
  }

  @SuppressWarnings("removal")
  @Bean
  SimpleRabbitListenerContainerFactory trendingInCommunitiesListenerFactory(
      ConnectionFactory connectionFactory,
      Jackson2JsonMessageConverter messageConverter,
      Advice trendingInCommunitiesRetryInterceptor) {
    SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
    factory.setConnectionFactory(connectionFactory);
    factory.setMessageConverter(messageConverter);
    factory.setAdviceChain(trendingInCommunitiesRetryInterceptor);
    factory.setDefaultRequeueRejected(false);
    return factory;
  }

  @Bean
  Advice catalogSurpriseRetryInterceptor() {
    return RetryInterceptorBuilder.stateless()
        .maxRetries(3)
        .backOffOptions(2_000, 2.0, 10_000)
        .build();
  }

  @SuppressWarnings("removal")
  @Bean
  SimpleRabbitListenerContainerFactory catalogSurpriseListenerFactory(
      ConnectionFactory connectionFactory,
      Jackson2JsonMessageConverter messageConverter,
      Advice catalogSurpriseRetryInterceptor) {
    SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
    factory.setConnectionFactory(connectionFactory);
    factory.setMessageConverter(messageConverter);
    factory.setAdviceChain(catalogSurpriseRetryInterceptor);
    factory.setDefaultRequeueRejected(false);
    return factory;
  }
}
