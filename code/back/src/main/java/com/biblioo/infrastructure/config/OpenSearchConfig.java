package com.biblioo.infrastructure.config;

import java.util.concurrent.TimeUnit;
import org.apache.http.HttpHost;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.impl.client.BasicCredentialsProvider;
import org.apache.http.impl.nio.conn.PoolingNHttpClientConnectionManager;
import org.apache.http.impl.nio.reactor.DefaultConnectingIOReactor;
import org.apache.http.nio.reactor.IOReactorException;
import org.opensearch.client.RestClient;
import org.opensearch.client.json.jackson.JacksonJsonpMapper;
import org.opensearch.client.opensearch.OpenSearchClient;
import org.opensearch.client.transport.rest_client.RestClientTransport;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.util.StringUtils;

@Configuration
@EnableScheduling
public class OpenSearchConfig {

  @Value("${opensearch.host}")
  private String host;

  @Value("${opensearch.port}")
  private int port;

  @Value("${opensearch.scheme:http}")
  private String scheme;

  @Value("${opensearch.user:}")
  private String user;

  @Value("${opensearch.password:}")
  private String password;

  private PoolingNHttpClientConnectionManager connectionManager;

  @Bean
  public OpenSearchClient openSearchClient() throws IOReactorException {
    connectionManager = new PoolingNHttpClientConnectionManager(new DefaultConnectingIOReactor());

    RestClient restClient =
        RestClient.builder(new HttpHost(host, port, scheme))
            .setHttpClientConfigCallback(
                httpClientBuilder -> {
                  httpClientBuilder
                      .setConnectionManager(connectionManager)
                      .setKeepAliveStrategy((response, context) -> 30_000)
                      .setConnectionReuseStrategy((response, context) -> true);

                  if (StringUtils.hasText(user) && StringUtils.hasText(password)) {
                    var cp = new BasicCredentialsProvider();
                    cp.setCredentials(AuthScope.ANY, new UsernamePasswordCredentials(user, password));
                    httpClientBuilder.setDefaultCredentialsProvider(cp);
                  }

                  return httpClientBuilder;
                })
            .setRequestConfigCallback(
                requestConfigBuilder ->
                    requestConfigBuilder.setConnectTimeout(3_000).setSocketTimeout(5_000))
            .build();

    RestClientTransport transport = new RestClientTransport(restClient, new JacksonJsonpMapper());
    return new OpenSearchClient(transport);
  }

  @Scheduled(fixedDelay = 5_000)
  void evictStaleConnections() {
    if (connectionManager != null) {
      connectionManager.closeExpiredConnections();
      connectionManager.closeIdleConnections(10, TimeUnit.SECONDS);
    }
  }
}
