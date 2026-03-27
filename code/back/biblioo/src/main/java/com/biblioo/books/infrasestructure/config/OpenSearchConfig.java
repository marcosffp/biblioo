package com.biblioo.books.infrasestructure.config;

import org.apache.http.HttpHost;
import org.opensearch.client.RestClient;
import org.opensearch.client.json.jackson.JacksonJsonpMapper;
import org.opensearch.client.opensearch.OpenSearchClient;
import org.opensearch.client.transport.rest_client.RestClientTransport;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

// OpenSearchConfig.java
@Configuration
public class OpenSearchConfig {

  @Value("${opensearch.host:localhost}")
  private String host;

  @Value("${opensearch.port:9200}")
  private int port;

  @Bean
  public OpenSearchClient openSearchClient() {
    RestClient restClient =
        RestClient.builder(new HttpHost(host, port, "http"))
            .setHttpClientConfigCallback(
                httpClientBuilder ->
                    httpClientBuilder
                        .setKeepAliveStrategy((response, context) -> 30_000) // 30s keep-alive
                        .setConnectionReuseStrategy((response, context) -> true))
            .setRequestConfigCallback(
                requestConfigBuilder ->
                    requestConfigBuilder.setConnectTimeout(3_000).setSocketTimeout(5_000))
            .build();

    RestClientTransport transport = new RestClientTransport(restClient, new JacksonJsonpMapper());
    return new OpenSearchClient(transport);
  }
}
