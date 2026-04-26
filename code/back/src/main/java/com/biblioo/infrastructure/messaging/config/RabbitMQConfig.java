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
import org.springframework.amqp.core.AnonymousQueue;

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

  // ── Community WebSocket Broadcast (cross-instance via AMQP fanout) ───────────
  // Cada instância cria um AnonymousQueue exclusivo e efêmero. O FanoutExchange
  // entrega para todas as instâncias; cada uma filtra a própria mensagem pelo
  // header x-instance-id e entrega as demais ao SimpleBroker local.
  public static final String COMMUNITY_BROADCAST_EXCHANGE = "biblioo.community.broadcast";

  // ── Recommendation T1 — BECAUSE_YOU_READ ────────────────────────────────────
  public static final String BYR_QUEUE = "rec.shelf.completed";
  public static final String BYR_DLQ = "rec.shelf.completed.dlq";
  public static final String BYR_DLQ_ROUTING_KEY = "rec.shelf.dead";
  public static final String SHELF_READING_COMPLETED_ROUTING_KEY = "shelf.reading.completed";
  public static final String EVENT_SHELF_READING_COMPLETED = "SHELF_READING_COMPLETED";

  // ── Recommendation T2 — FAVORITE_GENRE_NOW ───────────────────────────────────
  public static final String FGN_QUEUE = "rec.favorite-genre-now.triggered";
  public static final String FGN_DLQ = "rec.favorite-genre-now.triggered.dlq";
  public static final String FGN_DLQ_ROUTING_KEY = "rec.favorite-genre-now.dead";

  // ── Recommendation T3 — TRENDING_IN_COMMUNITIES ──────────────────────────────
  public static final String TIC_MESSAGE_QUEUE = "rec.trending-in-communities.message";
  public static final String TIC_MESSAGE_DLQ = "rec.trending-in-communities.message.dlq";
  public static final String TIC_MESSAGE_DLQ_ROUTING_KEY = "rec.trending-in-communities.message.dead";
  public static final String TIC_MESSAGE_ROUTING_KEY = "community.trending.message";

  public static final String TIC_JOIN_QUEUE = "rec.trending-in-communities.join";
  public static final String TIC_JOIN_DLQ = "rec.trending-in-communities.join.dlq";
  public static final String TIC_JOIN_DLQ_ROUTING_KEY = "rec.trending-in-communities.join.dead";
  public static final String TIC_JOIN_ROUTING_KEY = "community.trending.join";

  public static final String EVENT_COMMUNITY_MESSAGE_FOR_TRENDING = "COMMUNITY_MESSAGE_FOR_TRENDING";
  public static final String EVENT_COMMUNITY_JOIN_FOR_TRENDING = "COMMUNITY_JOIN_FOR_TRENDING";

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
  Queue byrQueue() {
    return QueueBuilder.durable(BYR_QUEUE)
        .withArgument("x-dead-letter-exchange", DLX_EXCHANGE)
        .withArgument("x-dead-letter-routing-key", BYR_DLQ_ROUTING_KEY)
        .build();
  }

  @Bean
  Queue byrDlq() {
    return QueueBuilder.durable(BYR_DLQ).build();
  }

  @Bean
  Binding byrBinding(Queue byrQueue, TopicExchange mainExchange) {
    return BindingBuilder.bind(byrQueue).to(mainExchange).with(SHELF_READING_COMPLETED_ROUTING_KEY);
  }

  @Bean
  Binding byrDlqBinding(Queue byrDlq, DirectExchange dlxExchange) {
    return BindingBuilder.bind(byrDlq).to(dlxExchange).with(BYR_DLQ_ROUTING_KEY);
  }

  @Bean
  Queue fgnQueue() {
    return QueueBuilder.durable(FGN_QUEUE)
        .withArgument("x-dead-letter-exchange", DLX_EXCHANGE)
        .withArgument("x-dead-letter-routing-key", FGN_DLQ_ROUTING_KEY)
        .build();
  }

  @Bean
  Queue fgnDlq() {
    return QueueBuilder.durable(FGN_DLQ).build();
  }

  @Bean
  Binding fgnBinding(Queue fgnQueue, TopicExchange mainExchange) {
    // Mesmo routing key do T1 — cada fila recebe uma cópia independente do evento
    return BindingBuilder.bind(fgnQueue).to(mainExchange).with(SHELF_READING_COMPLETED_ROUTING_KEY);
  }

  @Bean
  Binding fgnDlqBinding(Queue fgnDlq, DirectExchange dlxExchange) {
    return BindingBuilder.bind(fgnDlq).to(dlxExchange).with(FGN_DLQ_ROUTING_KEY);
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

  // ── Recommendation T3 — TRENDING_IN_COMMUNITIES beans ───────────────────────

  @Bean
  Queue ticMessageQueue() {
    return QueueBuilder.durable(TIC_MESSAGE_QUEUE)
        .withArgument("x-dead-letter-exchange", DLX_EXCHANGE)
        .withArgument("x-dead-letter-routing-key", TIC_MESSAGE_DLQ_ROUTING_KEY)
        .build();
  }

  @Bean
  Queue ticMessageDlq() {
    return QueueBuilder.durable(TIC_MESSAGE_DLQ).build();
  }

  @Bean
  Binding ticMessageBinding(Queue ticMessageQueue, TopicExchange mainExchange) {
    return BindingBuilder.bind(ticMessageQueue).to(mainExchange).with(TIC_MESSAGE_ROUTING_KEY);
  }

  @Bean
  Binding ticMessageDlqBinding(Queue ticMessageDlq, DirectExchange dlxExchange) {
    return BindingBuilder.bind(ticMessageDlq).to(dlxExchange).with(TIC_MESSAGE_DLQ_ROUTING_KEY);
  }

  @Bean
  Queue ticJoinQueue() {
    return QueueBuilder.durable(TIC_JOIN_QUEUE)
        .withArgument("x-dead-letter-exchange", DLX_EXCHANGE)
        .withArgument("x-dead-letter-routing-key", TIC_JOIN_DLQ_ROUTING_KEY)
        .build();
  }

  @Bean
  Queue ticJoinDlq() {
    return QueueBuilder.durable(TIC_JOIN_DLQ).build();
  }

  @Bean
  Binding ticJoinBinding(Queue ticJoinQueue, TopicExchange mainExchange) {
    return BindingBuilder.bind(ticJoinQueue).to(mainExchange).with(TIC_JOIN_ROUTING_KEY);
  }

  @Bean
  Binding ticJoinDlqBinding(Queue ticJoinDlq, DirectExchange dlxExchange) {
    return BindingBuilder.bind(ticJoinDlq).to(dlxExchange).with(TIC_JOIN_DLQ_ROUTING_KEY);
  }

  // ── Community WebSocket Broadcast beans ─────────────────────────────────────

  @Bean
  FanoutExchange communityBroadcastExchange() {
    return new FanoutExchange(COMMUNITY_BROADCAST_EXCHANGE, true, false);
  }

  @Bean
  Queue communityBroadcastQueue() {
    // Nome único por instância, auto-deletado quando a instância desconecta do RabbitMQ.
    return new AnonymousQueue();
  }

  @Bean
  Binding communityBroadcastBinding(
      Queue communityBroadcastQueue, FanoutExchange communityBroadcastExchange) {
    return BindingBuilder.bind(communityBroadcastQueue).to(communityBroadcastExchange);
  }

  @Bean
  SimpleRabbitListenerContainerFactory communityBroadcastListenerFactory(
      ConnectionFactory connectionFactory) {
    SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
    factory.setConnectionFactory(connectionFactory);
    factory.setDefaultRequeueRejected(false);
    return factory;
  }
}
