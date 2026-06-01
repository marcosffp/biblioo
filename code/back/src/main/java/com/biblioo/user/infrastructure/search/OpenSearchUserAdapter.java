package com.biblioo.user.infrastructure.search;

import com.biblioo.user.domain.model.User;
import com.biblioo.user.domain.port.out.UserSearchPort;
import com.biblioo.user.infrastructure.persistence.UserRepository;
import java.io.IOException;
import java.util.List;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.opensearch.client.opensearch.OpenSearchClient;
import org.opensearch.client.opensearch._types.query_dsl.MatchPhrasePrefixQuery;
import org.opensearch.client.opensearch.core.DeleteRequest;
import org.opensearch.client.opensearch.core.IndexRequest;
import org.opensearch.client.opensearch.core.SearchRequest;
import org.opensearch.client.opensearch.core.search.Hit;
import org.opensearch.client.transport.endpoints.BooleanResponse;
import org.springframework.data.domain.PageRequest;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Recover;
import org.springframework.retry.annotation.Retryable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class OpenSearchUserAdapter implements UserSearchPort {

  private static final String INDEX_NAME = "users";
  private static final int MAX_RESULTS = 20;

  private final OpenSearchClient client;
  private final UserRepository userRepository;

  @Override
  @Retryable(
      retryFor = IllegalStateException.class,
      maxAttempts = 3,
      backoff = @Backoff(delay = 200, multiplier = 2),
      recover = "searchFallback")
  public List<User> search(String term, int page, int size) {
    try {
      var prefixQuery = MatchPhrasePrefixQuery.of(mp -> mp.field("username").query(term));
      int safePage = Math.max(page, 0);
      int safeSize = Math.clamp(size, 1, MAX_RESULTS);

      var request =
          SearchRequest.of(
              sr ->
                  sr.index(INDEX_NAME)
                      .query(q -> q.matchPhrasePrefix(prefixQuery))
                      .from(safePage * safeSize)
                      .size(safeSize));

      var response = client.search(request, UserDocument.class);

      List<User> indexedUsers =
          response.hits().hits().stream()
          .map(Hit::source)
          .filter(Objects::nonNull)
          .map(UserDocument::toUser)
          .toList();

      if (!indexedUsers.isEmpty()) {
        return indexedUsers;
      }

      return userRepository.findByUsernamePrefix(term, PageRequest.of(safePage, safeSize));

    } catch (IOException e) {
      throw new IllegalStateException("OpenSearch user search falhou", e);
    }
  }

  @Recover
  public List<User> searchFallback(IllegalStateException e, String term, int page, int size) {
    log.warn(
        "OpenSearch indisponivel durante user search apos 3 tentativas. term='{}'. Causa: {}. Aplicando fallback em MySQL.",
        term,
        e.getCause() != null ? e.getCause().getMessage() : e.getMessage());

    int safePage = Math.max(page, 0);
    int safeSize = Math.clamp(size, 1, MAX_RESULTS);
    return userRepository.findByUsernamePrefix(term, PageRequest.of(safePage, safeSize));
  }

  @Override
  public void index(User user) {
    try {
      var doc = UserDocument.fromUser(user);
      var request =
          IndexRequest.of(
              ir -> ir.index(INDEX_NAME).id(String.valueOf(user.getId())).document(doc));
      client.index(request);
    } catch (IOException e) {
      log.error(
          "Falha ao indexar usuário no OpenSearch. id={}. Dado permanece no MySQL. Causa: {}",
          user.getId(),
          e.getMessage());
    }
  }

  @Override
  public void deleteFromIndex(Long userId) {
    try {
      var request = DeleteRequest.of(dr -> dr.index(INDEX_NAME).id(String.valueOf(userId)));
      client.delete(request);
    } catch (IOException e) {
      log.error("Falha ao remover usuário do OpenSearch. id={}. Causa: {}", userId, e.getMessage());
    }
  }

  @Async
  @EventListener(ApplicationReadyEvent.class)
  public void bootstrapIndex() {
    try {
      BooleanResponse exists = client.indices().exists(e -> e.index(INDEX_NAME));
      if (!exists.value()) {
        client.indices().create(c -> c.index(INDEX_NAME));
      }

      long count = client.count(c -> c.index(INDEX_NAME)).count();
      if (count > 0) {
        return;
      }

      userRepository.findAll().forEach(this::index);

    } catch (Exception e) {
      log.error(
          "Falha no bootstrap do índice users. Busca indisponível até próximo restart. Causa: {}",
          e.getMessage());
    }
  }

  record UserDocument(Long id, String username, String avatarUrl, String bannerUrl) {

    static UserDocument fromUser(User user) {
      return new UserDocument(
          user.getId(), user.getUsername(), user.getAvatarUrl(), user.getBannerUrl());
    }

    User toUser() {
      User user = new User();
      user.setId(id);
      user.setUsername(username);
      user.setAvatarUrl(avatarUrl);
      user.setBannerUrl(bannerUrl);
      return user;
    }
  }
}
