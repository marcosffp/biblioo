package com.biblioo.community.infrastructure.config;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

  private final JwtChannelInterceptor jwtChannelInterceptor;
  private final SubscriptionAuthorizationInterceptor subscriptionAuthorizationInterceptor;

  @Value("${app.websocket.allowed-origins}")
  private String allowedOrigins;

  // @Lazy garante que o bean é recuperado do contexto já totalmente inicializado
  // (afterPropertiesSet chamado), não durante a fase de construção de @EnableWebSocketMessageBroker.
  @Autowired
  @Lazy
  private TaskScheduler webSocketHeartbeatScheduler;

  @Override
  public void configureMessageBroker(MessageBrokerRegistry registry) {
    // SimpleBroker: subscriptions gerenciadas em memória, por instância.
    // Cross-instance delivery é feito via AMQP FanoutExchange em WebSocketMessageBroadcastAdapter
    // + CommunityBroadcastConsumer — o RabbitMQ não gerencia mais sessões STOMP por cliente.
    registry
        .enableSimpleBroker("/topic", "/queue")
        .setHeartbeatValue(new long[] {10_000, 10_000})
        .setTaskScheduler(webSocketHeartbeatScheduler);

    registry.setApplicationDestinationPrefixes("/app");
    registry.setUserDestinationPrefix("/user");
  }

  /**
   * Scheduler dedicado ao heartbeat do SimpleBroker. initialize() é chamado explicitamente para
   * garantir que o pool de threads existe no momento em que o SimpleBroker fizer o primeiro
   * schedule — independente de quando o Spring chamar afterPropertiesSet(). removeOnCancelPolicy
   * garante que tasks de sessões fechadas sejam removidas da fila imediatamente, evitando
   * acúmulo de referências de conexões zumbi.
   */
  @Bean
  TaskScheduler webSocketHeartbeatScheduler() {
    ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
    scheduler.setPoolSize(2);
    scheduler.setThreadNamePrefix("ws-heartbeat-");
    scheduler.setRemoveOnCancelPolicy(true);
    scheduler.initialize();
    return scheduler;
  }

  @Override
  public void registerStompEndpoints(StompEndpointRegistry registry) {
    String[] origins = allowedOrigins.split(",");
    registry.addEndpoint("/ws/community").setAllowedOriginPatterns(origins).withSockJS();
    registry.addEndpoint("/ws").setAllowedOriginPatterns(origins);
  }

  @Override
  public void configureClientInboundChannel(ChannelRegistration registration) {
    registration
        .interceptors(jwtChannelInterceptor, subscriptionAuthorizationInterceptor)
        .taskExecutor()
        .corePoolSize(20)
        .maxPoolSize(50)
        .queueCapacity(200);
  }

  @Override
  public void configureClientOutboundChannel(ChannelRegistration registration) {
    registration.taskExecutor().corePoolSize(20).maxPoolSize(50).queueCapacity(500);
  }
}
