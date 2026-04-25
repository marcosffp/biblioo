# Criar novo trilho de recomendação

Cria todos os artefatos necessários para um novo trilho de recomendação no módulo `recommendation`, seguindo exatamente o padrão do trilho existente **BecauseYouRead (T1)**.

**Argumento obrigatório:** nome do trilho em PascalCase (ex.: `TopRated`, `TrendingNow`, `FriendsAreReading`).

---

## Contexto arquitetural

O módulo de recomendação usa arquitetura hexagonal:

```
recommendation/
  domain/
    model/        → entidades JPA e objetos de valor
    port/in/      → interface RecommendationUseCase (casos de uso)
    service/      → serviços de domínio (implementam port/in)
    exception/
  infrastructure/
    config/       → listener factory e configs de infra
    consumer/     → @RabbitListener (ponto de entrada do evento)
    dto/          → RecommendationResponse (já existente, reutilizar)
    graph/        → Neo4jGraphService (queries Cypher)
    persistence/  → repositórios JPA (wrappers + interfaces Spring Data)
    service/      → fallback SQL
    web/          → RecommendationController (adicionar endpoint)
```

**Entidades reutilizadas** — não criar novas:
- `RecommendationResult` (tabela `recommendation_results`, chave única `user_id + trail_type`)
- `RecommendationEventLog` (tabela `recommendation_event_log`, idempotência)
- `BookScore` (objeto de valor com `bookId`, `score`, `source`)
- `RecommendationResponse` (DTO de resposta HTTP)

---

## Passos

### 0. Capturar o argumento

O argumento `$ARGUMENTS` fornece o nome do trilho em PascalCase. Derivar:

- `TRAIL_NAME` = `$ARGUMENTS` em PascalCase (ex.: `TopRated`)
- `TRAIL_CONSTANT` = `TRAIL_NAME` em UPPER_SNAKE_CASE (ex.: `TOP_RATED`)
- `TRAIL_TYPE_VALUE` = `TRAIL_CONSTANT` como string literal (ex.: `"TOP_RATED"`)
- `trail_kebab` = `TRAIL_NAME` em kebab-case para URL e queue (ex.: `top-rated`)
- `trailCamel` = `TRAIL_NAME` com primeira letra minúscula para variáveis/métodos (ex.: `topRated`)

Antes de criar qualquer arquivo, **perguntar ao usuário**:

1. Qual evento RabbitMQ dispara este trilho? (routing key, nome da fila)
2. A lógica usa Neo4j (grafo) ou apenas SQL? (ou ambos com fallback)
3. Quais parâmetros de negócio configuráveis são necessários? (ex.: `candidateLimit`, `minScore`)
4. O trilho é computado assincronamente via consumer, ou sob demanda (request HTTP)?

---

### 1. Adicionar método ao `RecommendationUseCase`

Arquivo: `src/main/java/com/biblioo/recommendation/domain/port/in/RecommendationUseCase.java`

Adicionar o método:

```java
List<BookScore> get{TRAIL_NAME}(Long userId);
```

---

### 2. Criar o serviço de domínio

Arquivo: `src/main/java/com/biblioo/recommendation/domain/service/{TRAIL_NAME}Service.java`

Template:

```java
package com.biblioo.recommendation.domain.service;

import com.biblioo.recommendation.domain.model.BookScore;
import com.biblioo.recommendation.domain.port.in.RecommendationUseCase;
import com.biblioo.recommendation.infrastructure.graph.Neo4jGraphService;
import com.biblioo.recommendation.infrastructure.persistence.RecommendationResultRepository;
import com.biblioo.recommendation.infrastructure.service.{TRAIL_NAME}FallbackService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class {TRAIL_NAME}Service {

  private final Neo4jGraphService neo4jGraphService;               // remover se trilho não usa grafo
  private final {TRAIL_NAME}FallbackService fallbackService;
  private final RecommendationResultRepository resultRepository;

  @Value("${recommendation.{trailCamel}.candidate-limit:20}")
  private int candidateLimit;

  // adicionar outros @Value conforme parâmetros levantados no passo 0

  /** Computa e persiste recomendações para o usuário. Chamado pelo consumer. */
  public void compute(Long userId /* , outros parâmetros do evento */) {
    log.info("Computando trilho {TRAIL_NAME} para userId={}", userId);

    List<BookScore> candidates = computeWithFallback(userId);
    List<BookScore> result = postProcess(candidates);

    resultRepository.upsert(userId, "{TRAIL_TYPE_VALUE}", result);
    log.info("Trilho {TRAIL_NAME} persistido: {} livros para userId={}", result.size(), userId);
  }

  /** Implementa get{TRAIL_NAME} do RecommendationUseCase (chamado pelo controller). */
  public List<BookScore> get{TRAIL_NAME}(Long userId) {
    return resultRepository.findByUserId(userId, "{TRAIL_TYPE_VALUE}");
  }

  // --- privados ---

  private List<BookScore> computeWithFallback(Long userId) {
    try {
      return neo4jGraphService.compute{TRAIL_NAME}(userId, candidateLimit);
    } catch (Exception ex) {
      log.warn("Neo4j indisponível para trilho {TRAIL_NAME}, usando fallback SQL. userId={}", userId, ex);
      return fallbackService.compute(userId);
    }
  }

  private List<BookScore> postProcess(List<BookScore> candidates) {
    // Aplicar jitter de score e limitar candidatos, se necessário.
    // Ver BecauseYouReadService#postProcess como referência.
    return candidates.stream().limit(candidateLimit).toList();
  }
}
```

**Importante:** o serviço de domínio **não implementa** `RecommendationUseCase` diretamente — apenas expõe `get{TRAIL_NAME}` com a mesma assinatura. O `RecommendationController` injeta o `RecommendationUseCase`, que deve ser atualizado para delegar ao novo service. Adicionar a implementação do novo método na classe que implementa `RecommendationUseCase` (hoje `BecauseYouReadService` concentra tudo — avaliar se cabe extrair uma fachada ou adicionar o delegate lá mesmo).

---

### 3. Criar o fallback SQL

Arquivo: `src/main/java/com/biblioo/recommendation/infrastructure/service/{TRAIL_NAME}FallbackService.java`

Template baseado em `BecauseYouReadFallbackService`:

```java
package com.biblioo.recommendation.infrastructure.service;

import com.biblioo.recommendation.domain.model.BookScore;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
public class {TRAIL_NAME}FallbackService {

  @PersistenceContext
  private EntityManager entityManager;

  @Transactional(readOnly = true)
  public List<BookScore> compute(Long userId) {
    log.warn("Executando fallback SQL para trilho {TRAIL_NAME}. userId={}", userId);

    // TODO: implementar query nativa com a lógica de scoring específica deste trilho.
    // Padrão de score do BecauseYouRead:
    //   score = (avg_rating/5 * 0.5) + (log(reader_count) * 0.3) + (category_bonus * 0.2)
    // Adaptar a fórmula conforme a semântica do novo trilho.
    //
    // Obrigações:
    //   - Excluir livros já lidos pelo usuário (COMPLETED ou READING)
    //   - Retornar no máximo 20 candidatos
    //   - Definir source = "sql_fallback"

    String sql = """
        /* TODO: substituir por query real */
        SELECT 0 AS book_id, 0.0 AS score
        WHERE 1 = 0
        """;

    @SuppressWarnings("unchecked")
    List<Object[]> rows = entityManager.createNativeQuery(sql)
        .setParameter("userId", userId)
        .getResultList();

    return rows.stream()
        .map(r -> new BookScore(
            ((Number) r[0]).longValue(),
            ((Number) r[1]).doubleValue(),
            "sql_fallback"))
        .toList();
  }
}
```

---

### 4. Adicionar queries Cypher ao `Neo4jGraphService`

Arquivo: `src/main/java/com/biblioo/recommendation/infrastructure/graph/Neo4jGraphService.java`

Adicionar o método:

```java
public List<BookScore> compute{TRAIL_NAME}(Long userId, int limit) {
  String cypher = """
      // TODO: implementar algoritmo Cypher para o trilho {TRAIL_NAME}.
      // Seguir o padrão do computeT1: usar executeRead(), retornar BookScore com source="graph".
      // Garantir que queries usem parâmetros nomeados ($userId, $limit) — nunca interpolar strings.
      MATCH (u:User {user_id: $userId})
      // ... lógica do trilho ...
      RETURN b.book_id AS bookId, score AS score
      ORDER BY score DESC
      LIMIT $limit
      """;

  try (var session = neo4jDriver.session(SessionConfig.forDatabase("neo4j"))) {
    return session.executeRead(tx -> {
      var result = tx.run(cypher, Map.of("userId", userId, "limit", limit));
      return result.list(r -> new BookScore(
          r.get("bookId").asLong(),
          r.get("score").asDouble(),
          "graph"));
    });
  }
}
```

Se o trilho **não usar Neo4j**, pular este passo e remover o `neo4jGraphService` do serviço de domínio.

---

### 5. Criar o consumer RabbitMQ

Arquivo: `src/main/java/com/biblioo/recommendation/infrastructure/consumer/{TRAIL_NAME}Consumer.java`

Template baseado em `RecommendationConsumer`:

```java
package com.biblioo.recommendation.infrastructure.consumer;

import com.biblioo.infrastructure.messaging.config.RabbitMQConfig;
import com.biblioo.recommendation.domain.exception.DuplicateEventException;
import com.biblioo.recommendation.domain.service.{TRAIL_NAME}Service;
import com.biblioo.recommendation.infrastructure.persistence.EventLogRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class {TRAIL_NAME}Consumer {

  private static final String TRAIL = "{TRAIL_TYPE_VALUE}";

  private final {TRAIL_NAME}Service {trailCamel}Service;
  private final EventLogRepository eventLogRepository;
  private final ObjectMapper objectMapper;

  @RabbitListener(
      queues = RabbitMQConfig.{TRAIL_CONSTANT}_QUEUE,
      containerFactory = "{trailCamel}ListenerFactory")
  public void handle(EventMessage message) {
    String eventId = message.getEventId();
    MDC.put("event_id", eventId);
    MDC.put("trail", TRAIL);
    try {
      if (eventLogRepository.existsByEventId(eventId)) {
        log.info("Evento duplicado ignorado: eventId={}", eventId);
        return;
      }

      JsonNode payload = objectMapper.readTree(message.getPayload());
      Long userId = payload.get("userId").asLong();
      // extrair outros campos do payload conforme o evento

      try {
        eventLogRepository.registerEvent(eventId, TRAIL, userId, message.getPayload());
      } catch (DuplicateEventException ex) {
        log.info("Race condition: evento já registrado. eventId={}", eventId);
        return;
      }

      {trailCamel}Service.compute(userId);

    } catch (Exception ex) {
      log.error("Falha ao processar evento do trilho {}. eventId={}", TRAIL, eventId, ex);
      throw new RuntimeException(ex);
    } finally {
      MDC.clear();
    }
  }
}
```

Se o trilho for **sob demanda** (sem consumer), pular este passo.

---

### 6. Criar a listener factory no config

Arquivo: `src/main/java/com/biblioo/recommendation/infrastructure/config/RecommendationListenerConfig.java`

Adicionar o bean `{trailCamel}ListenerFactory` seguindo o padrão do `recListenerFactory` existente:

```java
@Bean
public SimpleRabbitListenerContainerFactory {trailCamel}ListenerFactory(
    ConnectionFactory connectionFactory,
    Jackson2JsonMessageConverter messageConverter) {

  var factory = new SimpleRabbitListenerContainerFactory();
  factory.setConnectionFactory(connectionFactory);
  factory.setMessageConverter(messageConverter);
  factory.setDefaultRequeueRejected(false);
  factory.setAdviceChain({trailCamel}RetryInterceptor());
  return factory;
}

@Bean
public Advice {trailCamel}RetryInterceptor() {
  return RetryInterceptorBuilder.stateless()
      .maxAttempts(3)
      .backOffOptions(2_000, 2.0, 10_000)
      .build();
}
```

---

### 7. Registrar a fila no `RabbitMQConfig`

Arquivo: `src/main/java/com/biblioo/infrastructure/messaging/config/RabbitMQConfig.java`

Adicionar:

```java
// Constantes
public static final String {TRAIL_CONSTANT}_QUEUE     = "rec.{trail-kebab}.triggered";
public static final String {TRAIL_CONSTANT}_DLQ       = "rec.{trail-kebab}.triggered.dlq";
public static final String {TRAIL_CONSTANT}_ROUTING   = "{routing.key.do.evento}";

// Beans
@Bean
public Queue {trailCamel}Queue() {
  return QueueBuilder.durable({TRAIL_CONSTANT}_QUEUE)
      .withArgument("x-dead-letter-exchange", DEAD_LETTER_EXCHANGE)
      .withArgument("x-dead-letter-routing-key", "rec.{trail-kebab}.dead")
      .build();
}

@Bean
public Queue {trailCamel}Dlq() {
  return QueueBuilder.durable({TRAIL_CONSTANT}_DLQ).build();
}

@Bean
public Binding {trailCamel}Binding(Queue {trailCamel}Queue, TopicExchange exchange) {
  return BindingBuilder.bind({trailCamel}Queue).to(exchange).with({TRAIL_CONSTANT}_ROUTING);
}
```

---

### 8. Expor o endpoint REST

Arquivo: `src/main/java/com/biblioo/recommendation/infrastructure/web/RecommendationController.java`

Adicionar ao controller existente:

```java
@GetMapping("/{trail-kebab}")
@Operation(summary = "{TRAIL_NAME}", description = "Recomendações do trilho {TRAIL_NAME}")
public ResponseEntity<List<RecommendationResponse>> get{TRAIL_NAME}(
    @AuthenticationPrincipal UserDetails principal) {

  Long userId = Long.parseLong(principal.getUsername());
  List<BookScore> scores = recommendationUseCase.get{TRAIL_NAME}(userId);

  List<RecommendationResponse> response = scores.stream()
      .map(score -> {
        var book = bookUseCase.getBook(score.getBookId());
        return RecommendationResponse.builder()
            .id(book.getId())
            .title(book.getTitle())
            .description(book.getDescription())
            .pageCount(book.getPageCount())
            .readerCount(book.getReaderCount())
            .averageRating(book.getAverageRating())
            .coverUrl(book.getCoverUrl())
            .score(score.getScore())
            .build();
      })
      .toList();

  return ResponseEntity.ok(response);
}
```

---

### 9. Adicionar parâmetros no `application.properties`

Arquivo: `src/main/resources/application.properties`

```properties
# Trilho {TRAIL_NAME}
recommendation.{trailCamel}.candidate-limit=20
# adicionar outros parâmetros levantados no passo 0
```

---

### 10. Checklist final

Antes de considerar o trilho completo, verificar:

- [ ] `RecommendationUseCase` tem o novo método `get{TRAIL_NAME}`
- [ ] O novo método está implementado na classe que implementa `RecommendationUseCase`
- [ ] `{TRAIL_NAME}Service.compute()` é chamado pelo consumer (ou diretamente, se sob demanda)
- [ ] `RecommendationResultRepository.upsert()` é chamado com `trail_type = "{TRAIL_TYPE_VALUE}"`
- [ ] Consumer verifica idempotência com `eventLogRepository.existsByEventId()` + `registerEvent()` com `REQUIRES_NEW`
- [ ] Fila tem DLQ configurada em `RabbitMQConfig`
- [ ] Endpoint `/recommendations/{trail-kebab}` retorna 200 com lista (pode ser vazia antes da primeira computação)
- [ ] Parâmetros configuráveis estão em `application.properties` e lidos via `@Value`
- [ ] Nenhum `System.out` ou `printStackTrace()` — apenas `log.info/warn/error`
- [ ] `mvn spotless:apply` executado antes do commit
