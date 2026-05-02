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

  // ── Recommendation T4 — CATALOG_SURPRISE (Thompson Sampling) ────────────────
  // Fila única com dois bindings: shelf.reading.completed (α++) e shelf.reading.abandoned (β++)
  public static final String CATALOG_SURPRISE_QUEUE = "trail.catalog-surprise.recompute.queue";
  public static final String CATALOG_SURPRISE_DLQ = "trail.catalog-surprise.recompute.dlq";
  public static final String CATALOG_SURPRISE_DLQ_ROUTING_KEY = "trail.catalog-surprise.dead";
  public static final String SHELF_READING_ABANDONED_ROUTING_KEY = "shelf.reading.abandoned";
  public static final String EVENT_SHELF_READING_ABANDONED = "SHELF_READING_ABANDONED";

  // ── Recommendation T5 — SIMILAR_AUTHORS ──────────────────────────────────────
  public static final String SA_QUEUE = "rec.similar-authors.triggered";
  public static final String SA_DLQ = "rec.similar-authors.triggered.dlq";
  public static final String SA_DLQ_ROUTING_KEY = "rec.similar-authors.dead";

  // ── Recommendation T6 — REREAD_WORTH_IT ──────────────────────────────────────
  public static final String RWI_QUEUE = "rec.reread-worth-it.triggered";
  public static final String RWI_DLQ = "rec.reread-worth-it.triggered.dlq";
  public static final String RWI_DLQ_ROUTING_KEY = "rec.reread-worth-it.dead";

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

  // ── Feed Fan-out ─────────────────────────────────────────────────────────────
  public static final String FEED_FANOUT_QUEUE = "biblioo.feed.fanout";
  public static final String FEED_FANOUT_DLQ = "biblioo.feed.fanout.dlq";
  public static final String FEED_FANOUT_ROUTING_KEY = "feed.fanout.review";
  public static final String FEED_FANOUT_ROUTING_PATTERN = "feed.fanout.#";
  public static final String FEED_FANOUT_DLQ_ROUTING_KEY = "feed.fanout.dead";
  public static final String EVENT_REVIEW_PUBLISHED = "REVIEW_PUBLISHED";
  public static final String EVENT_POST_PUBLISHED = "POST_PUBLISHED";
  public static final String FEED_POST_ROUTING_KEY = "feed.fanout.post";

  public static final String FEED_BACKFILL_QUEUE = "biblioo.feed.follow.backfill";
  public static final String FEED_BACKFILL_DLQ = "biblioo.feed.follow.backfill.dlq";
  public static final String FEED_BACKFILL_DLQ_ROUTING_KEY = "feed.backfill.dead";

  // ── Recommendation T4 — CATALOG_SURPRISE beans ──────────────────────────────

  @Bean
  Queue catalogSurpriseQueue() {
    return QueueBuilder.durable(CATALOG_SURPRISE_QUEUE)
        .withArgument("x-dead-letter-exchange", DLX_EXCHANGE)
        .withArgument("x-dead-letter-routing-key", CATALOG_SURPRISE_DLQ_ROUTING_KEY)
        .build();
  }

  @Bean
  Queue catalogSurpriseDlq() {
    return QueueBuilder.durable(CATALOG_SURPRISE_DLQ).build();
  }

  @Bean
  Binding catalogSurpriseCompletedBinding(Queue catalogSurpriseQueue, TopicExchange mainExchange) {
    // Recebe cópia independente do shelf.reading.completed → α++ no bandit
    return BindingBuilder.bind(catalogSurpriseQueue)
        .to(mainExchange)
        .with(SHELF_READING_COMPLETED_ROUTING_KEY);
  }

  @Bean
  Binding catalogSurpriseAbandonedBinding(Queue catalogSurpriseQueue, TopicExchange mainExchange) {
    // Recebe eventos de livro abandonado → β++ no bandit
    return BindingBuilder.bind(catalogSurpriseQueue)
        .to(mainExchange)
        .with(SHELF_READING_ABANDONED_ROUTING_KEY);
  }

  @Bean
  Binding catalogSurpriseDlqBinding(Queue catalogSurpriseDlq, DirectExchange dlxExchange) {
    return BindingBuilder.bind(catalogSurpriseDlq)
        .to(dlxExchange)
        .with(CATALOG_SURPRISE_DLQ_ROUTING_KEY);
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

  @Bean
  Queue feedFanoutQueue() {
    return QueueBuilder.durable(FEED_FANOUT_QUEUE)
        .withArgument("x-dead-letter-exchange", DLX_EXCHANGE)
        .withArgument("x-dead-letter-routing-key", FEED_FANOUT_DLQ_ROUTING_KEY)
        .build();
  }

  @Bean
  Queue feedFanoutDlq() {
    return QueueBuilder.durable(FEED_FANOUT_DLQ).build();
  }

  @Bean
  Binding feedFanoutBinding(Queue feedFanoutQueue, TopicExchange mainExchange) {
    return BindingBuilder.bind(feedFanoutQueue).to(mainExchange).with(FEED_FANOUT_ROUTING_PATTERN);
  }

  @Bean
  Binding feedFanoutDlqBinding(Queue feedFanoutDlq, DirectExchange dlxExchange) {
    return BindingBuilder.bind(feedFanoutDlq).to(dlxExchange).with(FEED_FANOUT_DLQ_ROUTING_KEY);
  }

  @Bean
  Queue feedBackfillQueue() {
    return QueueBuilder.durable(FEED_BACKFILL_QUEUE)
        .withArgument("x-dead-letter-exchange", DLX_EXCHANGE)
        .withArgument("x-dead-letter-routing-key", FEED_BACKFILL_DLQ_ROUTING_KEY)
        .build();
  }

  @Bean
  Queue feedBackfillDlq() {
    return QueueBuilder.durable(FEED_BACKFILL_DLQ).build();
  }

  @Bean
  Binding feedBackfillBinding(Queue feedBackfillQueue, TopicExchange mainExchange) {
    // Recebe cópia independente do mesmo evento de follow aceito que a fila de notificações
    return BindingBuilder.bind(feedBackfillQueue)
        .to(mainExchange)
        .with(NOTIFICATION_FOLLOWED_ROUTING_KEY);
  }

  @Bean
  Binding feedBackfillDlqBinding(Queue feedBackfillDlq, DirectExchange dlxExchange) {
    return BindingBuilder.bind(feedBackfillDlq).to(dlxExchange).with(FEED_BACKFILL_DLQ_ROUTING_KEY);
  }

  // ── Recommendation T5 — SIMILAR_AUTHORS beans ───────────────────────────────

  @Bean
  Queue saQueue() {
    return QueueBuilder.durable(SA_QUEUE)
        .withArgument("x-dead-letter-exchange", DLX_EXCHANGE)
        .withArgument("x-dead-letter-routing-key", SA_DLQ_ROUTING_KEY)
        .build();
  }

  @Bean
  Queue saDlq() {
    return QueueBuilder.durable(SA_DLQ).build();
  }

  @Bean
  Binding saBinding(Queue saQueue, TopicExchange mainExchange) {
    // Cópia independente do shelf.reading.completed — mesmo routing key do T1/T2/RWI
    return BindingBuilder.bind(saQueue).to(mainExchange).with(SHELF_READING_COMPLETED_ROUTING_KEY);
  }

  @Bean
  Binding saDlqBinding(Queue saDlq, DirectExchange dlxExchange) {
    return BindingBuilder.bind(saDlq).to(dlxExchange).with(SA_DLQ_ROUTING_KEY);
  }

  // ── Recommendation T6 — REREAD_WORTH_IT beans ───────────────────────────────

  @Bean
  Queue rwiQueue() {
    return QueueBuilder.durable(RWI_QUEUE)
        .withArgument("x-dead-letter-exchange", DLX_EXCHANGE)
        .withArgument("x-dead-letter-routing-key", RWI_DLQ_ROUTING_KEY)
        .build();
  }

  @Bean
  Queue rwiDlq() {
    return QueueBuilder.durable(RWI_DLQ).build();
  }

  @Bean
  Binding rwiBinding(Queue rwiQueue, TopicExchange mainExchange) {
    // Cópia independente do shelf.reading.completed — mesmo routing key do T1/T2
    return BindingBuilder.bind(rwiQueue).to(mainExchange).with(SHELF_READING_COMPLETED_ROUTING_KEY);
  }

  @Bean
  Binding rwiDlqBinding(Queue rwiDlq, DirectExchange dlxExchange) {
    return BindingBuilder.bind(rwiDlq).to(dlxExchange).with(RWI_DLQ_ROUTING_KEY);
  }

  // ── Email (SendGrid via RabbitMQ) ────────────────────────────────────────────
  public static final String EMAIL_QUEUE = "biblioo.email";
  public static final String EMAIL_DLQ = "biblioo.email.dlq";
  public static final String EMAIL_ROUTING_PATTERN = "email.#";
  public static final String EMAIL_DLQ_ROUTING_KEY = "email.dead";
  public static final String EMAIL_PASSWORD_RESET_ROUTING_KEY = "email.password-reset";
  public static final String EMAIL_PASSWORD_CHANGED_ROUTING_KEY = "email.password-changed";
  public static final String EVENT_PASSWORD_RESET_REQUESTED = "PASSWORD_RESET_REQUESTED";
  public static final String EVENT_PASSWORD_CHANGED = "PASSWORD_CHANGED";

  @Bean
  Queue emailQueue() {
    return QueueBuilder.durable(EMAIL_QUEUE)
        .withArgument("x-dead-letter-exchange", DLX_EXCHANGE)
        .withArgument("x-dead-letter-routing-key", EMAIL_DLQ_ROUTING_KEY)
        .build();
  }

  @Bean
  Queue emailDlq() {
    return QueueBuilder.durable(EMAIL_DLQ).build();
  }

  @Bean
  Binding emailBinding(Queue emailQueue, TopicExchange mainExchange) {
    return BindingBuilder.bind(emailQueue).to(mainExchange).with(EMAIL_ROUTING_PATTERN);
  }

  @Bean
  Binding emailDlqBinding(Queue emailDlq, DirectExchange dlxExchange) {
    return BindingBuilder.bind(emailDlq).to(dlxExchange).with(EMAIL_DLQ_ROUTING_KEY);
  }

  @SuppressWarnings("removal")
  @Bean
  SimpleRabbitListenerContainerFactory emailListenerFactory(
      ConnectionFactory connectionFactory, Jackson2JsonMessageConverter messageConverter) {
    SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
    factory.setConnectionFactory(connectionFactory);
    factory.setMessageConverter(messageConverter);
    factory.setDefaultRequeueRejected(false);
    return factory;
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
