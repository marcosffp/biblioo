package com.biblioo.notification.infrastructure.config;

import org.aopalliance.aop.Advice;
import org.springframework.amqp.rabbit.config.RetryInterceptorBuilder;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class NotificationListenerConfig {

  @Bean
  Advice notificationRetryInterceptor() {
    return RetryInterceptorBuilder.stateless()
        .maxRetries(3)
        .backOffOptions(2_000, 2.0, 10_000)
        .build();
  }

  @SuppressWarnings("removal")
  @Bean
  SimpleRabbitListenerContainerFactory notificationListenerFactory(
      ConnectionFactory connectionFactory,
      Jackson2JsonMessageConverter messageConverter,
      Advice notificationRetryInterceptor) {
    SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
    factory.setConnectionFactory(connectionFactory);
    factory.setMessageConverter(messageConverter);
    factory.setAdviceChain(notificationRetryInterceptor);
    factory.setDefaultRequeueRejected(false);
    return factory;
  }
}
