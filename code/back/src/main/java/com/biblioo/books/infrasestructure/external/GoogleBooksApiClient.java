package com.biblioo.books.infrasestructure.external;

import com.biblioo.books.infrasestructure.external.GoogleBooksModels.GoogleBooksResponse;
import com.biblioo.books.infrasestructure.external.GoogleBooksModels.VolumeItem;
import java.util.ArrayList;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.retry.support.RetryTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Slf4j
@Component
public class GoogleBooksApiClient {

  private static final String BASE_URL = "https://www.googleapis.com/books/v1";
  private static final int MAX_RESULTS = 15;

  private final RestClient restClient;
  private final String apiKey;
  private final RetryTemplate retryTemplate;

  public GoogleBooksApiClient(
      @Value("${google.books.api-key}") String apiKey,
      @Qualifier("cacheRetryTemplate") RetryTemplate retryTemplate) {
    this.apiKey = apiKey;
    this.retryTemplate = retryTemplate;
    this.restClient =
        RestClient.builder().baseUrl(BASE_URL).defaultHeader("Accept", "application/json").build();
  }

  public List<VolumeItem> fetch(String queryString) {
    return retryTemplate.execute(
        ctx -> {
          if (ctx.getRetryCount() > 0) {
            log.debug(
                "Retentativa {} para Google Books. query='{}'", ctx.getRetryCount(), queryString);
          }
          GoogleBooksResponse response =
              restClient
                  .get()
                  .uri(
                      uri ->
                          uri.path("/volumes")
                              .queryParam("q", queryString)
                              .queryParam("maxResults", MAX_RESULTS)
                              .queryParam("printType", "books")
                              .queryParam("langRestrict", "pt")
                              .queryParam("orderBy", "relevance")
                              .queryParam("key", apiKey)
                              .build())
                  .retrieve()
                  .body(GoogleBooksResponse.class);

          if (response == null || response.items() == null) return new ArrayList<>();

          return response.items();
        },
        ctx -> {
          log.warn(
              "Falha na chamada Google Books após {} tentativas. query='{}'. Causa: {}",
              ctx.getRetryCount(),
              queryString,
              ctx.getLastThrowable() != null
                  ? ctx.getLastThrowable().getMessage()
                  : "desconhecida");
          return List.of();
        });
  }
}
