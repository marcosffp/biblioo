package com.biblioo.infrastructure.messaging.config;

import org.aopalliance.aop.Advice;
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.config.RetryInterceptorBuilder;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

  public static final String MAIN_EXCHANGE = "biblioo.events";
  public static final String DLX_EXCHANGE = "biblioo.events.dlx";

  public static final String BOOK_STATS_QUEUE = "biblioo.book.stats";
  public static final String BOOK_STATS_DLQ = "biblioo.book.stats.dlq";

  public static final String BOOK_STATS_ROUTING_PATTERN = "book.stats.#";

  public static final String BOOK_SHELF_ROUTING_KEY = "book.stats.shelf";
  public static final String BOOK_REVIEW_ROUTING_KEY = "book.stats.review";
  public static final String BOOK_STATS_DLQ_ROUTING_KEY = "book.stats.dead";

  public static final String EVENT_BOOK_SHELF_ADDED = "BOOK_SHELF_ADDED";
  public static final String EVENT_BOOK_SHELF_REMOVED = "BOOK_SHELF_REMOVED";
  public static final String EVENT_BOOK_REVIEW_STATS = "BOOK_REVIEW_STATS";

  @Bean
  TopicExchange mainExchange() {
    return ExchangeBuilder.topicExchange(MAIN_EXCHANGE).durable(true).build();
  }

  @Bean
  DirectExchange dlxExchange() {
    return ExchangeBuilder.directExchange(DLX_EXCHANGE).durable(true).build();
  }

  @Bean
  Queue bookStatsQueue() {
    return QueueBuilder.durable(BOOK_STATS_QUEUE)
        .withArgument("x-dead-letter-exchange", DLX_EXCHANGE)
        .withArgument("x-dead-letter-routing-key", BOOK_STATS_DLQ_ROUTING_KEY)
        .build();
  }

  @Bean
  Queue bookStatsDlq() {
    return QueueBuilder.durable(BOOK_STATS_DLQ).build();
  }

  @Bean
  Binding bookStatsBinding(Queue bookStatsQueue, TopicExchange mainExchange) {
    return BindingBuilder.bind(bookStatsQueue).to(mainExchange).with(BOOK_STATS_ROUTING_PATTERN);
  }

  @Bean
  Binding dlqBinding(Queue bookStatsDlq, DirectExchange dlxExchange) {
    return BindingBuilder.bind(bookStatsDlq).to(dlxExchange).with(BOOK_STATS_DLQ_ROUTING_KEY);
  }

  @Bean
  com.fasterxml.jackson.databind.ObjectMapper jackson2ObjectMapper() {
    com.fasterxml.jackson.databind.ObjectMapper mapper =
        new com.fasterxml.jackson.databind.ObjectMapper();
    mapper.findAndRegisterModules();
    return mapper;
  }

  @SuppressWarnings("removal")
  @Bean
  Jackson2JsonMessageConverter messageConverter(
      com.fasterxml.jackson.databind.ObjectMapper objectMapper) {
    return new Jackson2JsonMessageConverter(objectMapper);
  }

  @Bean
  RabbitTemplate rabbitTemplate(
      ConnectionFactory connectionFactory,
      @SuppressWarnings("removal") Jackson2JsonMessageConverter messageConverter) {
    RabbitTemplate template = new RabbitTemplate(connectionFactory);
    template.setMessageConverter(messageConverter);
    return template;
  }

  @Bean
  Advice bookStatsRetryInterceptor() {
    return RetryInterceptorBuilder.stateless()
        .maxRetries(3)
        .backOffOptions(2_000, 2.0, 10_000)
        .build();
  }

  @SuppressWarnings("removal")
  @Bean
  SimpleRabbitListenerContainerFactory bookStatsListenerFactory(
      ConnectionFactory connectionFactory,
      Jackson2JsonMessageConverter messageConverter,
      Advice bookStatsRetryInterceptor) {
    SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
    factory.setConnectionFactory(connectionFactory);
    factory.setMessageConverter(messageConverter);
    factory.setAdviceChain(bookStatsRetryInterceptor);
    factory.setDefaultRequeueRejected(false);
    return factory;
  }
}
