package com.biblioo.community.infrastructure.config;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

  private final JwtChannelInterceptor jwtChannelInterceptor;
  private final SubscriptionAuthorizationInterceptor subscriptionAuthorizationInterceptor;

  @Value("${spring.rabbitmq.host}")
  private String relayHost;

  @Value("${spring.rabbitmq.stomp.port}")
  private int relayPort;

  @Value("${spring.rabbitmq.username}")
  private String relayUser;

  @Value("${spring.rabbitmq.password}")
  private String relayPassword;

  @Value("${spring.rabbitmq.virtual-host}")
  private String virtualHost;

  @Value("${app.websocket.allowed-origins}")
  private String allowedOrigins;

  @Override
  public void configureMessageBroker(MessageBrokerRegistry registry) {
    registry
        .enableStompBrokerRelay("/topic", "/queue")
        .setRelayHost(relayHost)
        .setRelayPort(relayPort)
        .setClientLogin(relayUser)
        .setClientPasscode(relayPassword)
        .setSystemLogin(relayUser)
        .setSystemPasscode(relayPassword)
        .setVirtualHost(virtualHost);

    registry.setApplicationDestinationPrefixes("/app");
    registry.setUserDestinationPrefix("/user");
  }

  @Override
  public void registerStompEndpoints(StompEndpointRegistry registry) {
    String[] origins = allowedOrigins.split(",");
    registry.addEndpoint("/ws/community").setAllowedOriginPatterns(origins).withSockJS();
  }

  @Override
  public void configureClientInboundChannel(ChannelRegistration registration) {
    registration.interceptors(jwtChannelInterceptor, subscriptionAuthorizationInterceptor);
  }
}
