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

  // ── Notifications ────────────────────────────────────────────────────────────
  public static final String NOTIFICATION_QUEUE = "biblioo.notification";
  public static final String NOTIFICATION_DLQ = "biblioo.notification.dlq";
  public static final String NOTIFICATION_ROUTING_PATTERN = "notification.#";
  public static final String NOTIFICATION_DLQ_ROUTING_KEY = "notification.dead";

  public static final String NOTIFICATION_FOLLOW_REQUESTED_ROUTING_KEY =
      "notification.user.follow-request";
  public static final String NOTIFICATION_FOLLOWED_ROUTING_KEY = "notification.user.followed";

  public static final String EVENT_USER_FOLLOW_REQUESTED = "USER_FOLLOW_REQUESTED";
  public static final String EVENT_USER_FOLLOWED = "USER_FOLLOWED";

  // Community events
  public static final String NOTIFICATION_COMMUNITY_INVITE_ROUTING_KEY =
      "notification.community.invite";
  public static final String NOTIFICATION_COMMUNITY_JOIN_REQUEST_ROUTING_KEY =
      "notification.community.join-request";
  public static final String NOTIFICATION_COMMUNITY_JOIN_APPROVED_ROUTING_KEY =
      "notification.community.join-approved";

  public static final String EVENT_COMMUNITY_INVITE = "COMMUNITY_INVITE";
  public static final String EVENT_COMMUNITY_JOIN_REQUEST = "COMMUNITY_JOIN_REQUEST";
  public static final String EVENT_COMMUNITY_JOIN_APPROVED = "COMMUNITY_JOIN_APPROVED";

  // ── Community Messages (future FCM offline delivery) ─────────────────────────
  public static final String COMMUNITY_MESSAGE_QUEUE = "biblioo.community.message";
  public static final String COMMUNITY_MESSAGE_DLQ = "biblioo.community.message.dlq";
  public static final String COMMUNITY_MESSAGE_ROUTING_PATTERN = "community.message.#";
  public static final String COMMUNITY_MESSAGE_ROUTING_KEY = "community.message.created";
  public static final String COMMUNITY_MESSAGE_DLQ_ROUTING_KEY = "community.message.dead";
  public static final String EVENT_COMMUNITY_MESSAGE_CREATED = "COMMUNITY_MESSAGE_CREATED";

  // ── Recommendation T1 — BECAUSE_YOU_READ ────────────────────────────────────
  public static final String REC_QUEUE = "rec.shelf.completed";
  public static final String REC_DLQ = "rec.shelf.completed.dlq";
  public static final String REC_DLQ_ROUTING_KEY = "rec.shelf.dead";
  public static final String SHELF_READING_COMPLETED_ROUTING_KEY = "shelf.reading.completed";
  public static final String EVENT_SHELF_READING_COMPLETED = "SHELF_READING_COMPLETED";

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
  Queue notificationQueue() {
    return QueueBuilder.durable(NOTIFICATION_QUEUE)
        .withArgument("x-dead-letter-exchange", DLX_EXCHANGE)
        .withArgument("x-dead-letter-routing-key", NOTIFICATION_DLQ_ROUTING_KEY)
        .build();
  }

  @Bean
  Queue notificationDlq() {
    return QueueBuilder.durable(NOTIFICATION_DLQ).build();
  }

  @Bean
  Binding notificationBinding(Queue notificationQueue, TopicExchange mainExchange) {
    return BindingBuilder.bind(notificationQueue)
        .to(mainExchange)
        .with(NOTIFICATION_ROUTING_PATTERN);
  }

  @Bean
  Binding notificationDlqBinding(Queue notificationDlq, DirectExchange dlxExchange) {
    return BindingBuilder.bind(notificationDlq).to(dlxExchange).with(NOTIFICATION_DLQ_ROUTING_KEY);
  }

  @Bean
  Queue recQueue() {
    return QueueBuilder.durable(REC_QUEUE)
        .withArgument("x-dead-letter-exchange", DLX_EXCHANGE)
        .withArgument("x-dead-letter-routing-key", REC_DLQ_ROUTING_KEY)
        .build();
  }

  @Bean
  Queue recDlq() {
    return QueueBuilder.durable(REC_DLQ).build();
  }

  @Bean
  Binding recBinding(Queue recQueue, TopicExchange mainExchange) {
    return BindingBuilder.bind(recQueue).to(mainExchange).with(SHELF_READING_COMPLETED_ROUTING_KEY);
  }

  @Bean
  Binding recDlqBinding(Queue recDlq, DirectExchange dlxExchange) {
    return BindingBuilder.bind(recDlq).to(dlxExchange).with(REC_DLQ_ROUTING_KEY);
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
