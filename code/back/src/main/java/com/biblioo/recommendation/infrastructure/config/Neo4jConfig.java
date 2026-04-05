package com.biblioo.recommendation.infrastructure.config;

import java.util.concurrent.TimeUnit;
import org.neo4j.driver.AuthTokens;
import org.neo4j.driver.Config;
import org.neo4j.driver.Driver;
import org.neo4j.driver.GraphDatabase;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class Neo4jConfig {

  @Value("${neo4j.uri}")
  private String uri;

  @Value("${neo4j.authentication.username}")
  private String username;

  @Value("${neo4j.authentication.password}")
  private String password;

  @Value("${neo4j.connection-timeout}")
  private long connectionTimeoutMs;

  @Value("${neo4j.max-connection-pool-size}")
  private int maxPoolSize;

  @Bean(destroyMethod = "close")
  Driver neo4jDriver() {
    return GraphDatabase.driver(
        uri,
        AuthTokens.basic(username, password),
        Config.builder()
            .withConnectionTimeout(connectionTimeoutMs, TimeUnit.MILLISECONDS)
            .withMaxConnectionPoolSize(maxPoolSize)
            .withEventLoopThreads(4)
            .build());
  }
}
