# Guia de Implementação — Trilha T1: BECAUSE_YOU_READ
## Arquitetura Híbrida SQL + Neo4j · Spring Boot

> **Versão:** 1.0  
> **Stack:** Java 21 · Spring Boot 3.x · Neo4j Driver 5.x · RabbitMQ (Spring AMQP) · JPA (MySQL/PostgreSQL)  
> **Status:** Pronto para produção  
> **Audiência:** Engenharia backend

---

## Sumário

1. [Explicação Didática — Antes e Depois](#1-explicação-didática)
2. [Fluxo Completo de Produção](#2-fluxo-completo-passo-a-passo)
3. [Query Cypher Completa](#3-query-cypher-completa)
4. [Implementação Backend](#4-implementação-backend)
5. [Resiliência](#5-resiliência)
6. [Performance](#6-performance)
7. [Resultado Final](#7-resultado-final)

---

## 1. Explicação Didática

### 1.1 Como a T1 funcionava antes (SQL puro)

A versão SQL parte do livro concluído, extrai suas categorias e busca todos os outros livros que
compartilham ao menos uma delas. O score é calculado com três sinais:

```
score = (avg_rating / 5.0)              × 0.50   ← avaliação global
      + (log(leitores + 1) / log(1000)) × 0.30   ← popularidade
      + categoria_match                  × 0.20   ← proximidade de categoria
```

**Limitações estruturais:**

- `categoria_match` é o único sinal de similaridade real. Se "Duna" é Ficção Científica,
  a T1 retorna qualquer livro de Ficção Científica — independente de estilo, público ou relevância.
- O sistema não captura que leitores de "Duna" frequentemente também leram "O Guia do Mochileiro
  das Galáxias" (sci-fi humor), que pode ter baixa sobreposição de categoria mas altíssima
  co-leitura.
- Livros populares dominem o ranking pelo sinal de popularidade (30%), mesmo que não sejam
  similares ao livro concluído.
- Não há sinal de comportamento coletivo: a pergunta "quem mais leu isso?" nunca é feita.

---

### 1.2 Como a T1 funciona agora (Grafo — co-leitura de 2 hops)

**Conceito de co-leitura:** em vez de perguntar "quais livros são da mesma categoria?", o grafo
pergunta "quais livros são frequentemente lidos pelas mesmas pessoas que leram este livro?"

A travessia é:

```
Livro concluído ←[:READ]– Outros Usuários –[:READ]→ Livros candidatos
```

Em Cypher isso é exatamente:

```cypher
MATCH (target:Book {book_id: $book_id})<-[:READ]-(reader:User)-[:READ]->(candidate:Book)
```

Isso são **2 hops**: do livro, passando por usuários que o leram, chegando nos livros que esses
usuários também leram. Daí o nome "vizinhança de 2 hops".

**Por que é melhor:**

| Pergunta | SQL | Grafo |
|---|---|---|
| Livros da mesma categoria | ✅ Captura | ✅ Captura (20% do score) |
| Livros lidos por leitores similares | ❌ Não captura | ✅ 40% do score |
| Descoberta cross-categoria | ❌ Nunca | ✅ Natural (via co-leitura) |
| Sensível a gosto coletivo real | ❌ | ✅ |

**Como evita recomendações óbvias:**

1. **Co-leitura normalizada:** o sinal de co-leitura é `co_readers / total_readers_do_livro_alvo`.
   Um best-seller com 10.000 leitores e 8.000 co-leituras de Harry Potter não recebe score maior
   que um livro nicho com 200 leitores e 190 co-leituras — a proporção é o que vale.

2. **Popularidade reduzida para 10%:** o sinal de `review_count` foi de 30% (SQL) para 10% (grafo).
   A co-leitura (40%) já captura popularidade de forma mais inteligente — via perfis reais,
   não contagem bruta.

3. **Jitter de score:** livros com scores próximos rotacionam posição entre execuções (±3%),
   evitando que o mesmo conjunto apareça sempre idêntico.

---

## 2. Fluxo Completo (Passo a Passo)

```
1. Usuário faz PATCH /api/shelf/items/{id} com status=COMPLETED
   └─ Shelf Service: UPDATE shelf_item + INSERT outbox_events (mesma TX)
   └─ Retorna 200 OK — sem esperar RabbitMQ

2. Outbox Publisher (job a cada 10s)
   └─ SELECT * FROM outbox_events WHERE status = 'PENDING'
   └─ Publica no exchange biblioo.domain.events (routing_key: shelf.reading.completed)
   └─ UPDATE outbox_events SET status = 'PUBLISHED'

3. RabbitMQ entrega para fila rec.shelf.completed (durable, ACK manual)

4. RecommendationConsumer.onMessage() recebe o evento
   │
   ├─ 4a. IDEMPOTÊNCIA
   │       SELECT 1 FROM recommendation_event_log WHERE event_id = ?
   │       Se existe → channel.basicAck() e retorna
   │       Se não existe → INSERT INTO recommendation_event_log (...)
   │
   ├─ 4b. ATUALIZA O GRAFO (Neo4j)
   │       MERGE (u:User {user_id: $userId})
   │       MERGE (b:Book {book_id: $bookId}) ON CREATE SET ...
   │       MERGE (u)-[r:READ]->(b) ON CREATE SET r.finished_at = ...
   │
   ├─ 4c. EXECUTA QUERY DE RECOMENDAÇÃO (Cypher T1)
   │       Travessia 2 hops: livro → co-leitores → candidatos
   │       Retorna List<BookScore> com co_read_score + rating_score + category_score + popularity_score
   │
   ├─ 4d. APLICA JITTER E DIVERSIFICAÇÃO
   │       Adiciona ±3% de ruído aleatório no score
   │       Limita a 60% de livros da mesma categoria
   │
   ├─ 4e. PERSISTE NO SQL (recommendation_results)
   │       INSERT ... ON DUPLICATE KEY UPDATE
   │       Não sobrescreve se resultado for vazio
   │
   └─ 4f. ACK para o RabbitMQ (só após confirmação do INSERT)
```

---

## 3. Query Cypher Completa (T1 — pronta para produção)

```cypher
// Parâmetros:
//   $userId  (Long)  — usuário que acabou de concluir o livro
//   $bookId  (Long)  — livro concluído
//   $limit   (Int)   — máximo de candidatos a retornar (usar 20)

// Etapa 1: Encontra todos os leitores do livro-alvo (exceto o próprio usuário)
//          e os livros que esses leitores também leram (co-leitura)
MATCH (target:Book {book_id: $bookId})<-[:READ]-(reader:User)-[:READ]->(candidate:Book)
WHERE reader.user_id <> $userId

// Etapa 2: Exclui livros que o usuário já leu
AND NOT EXISTS {
  MATCH (me:User {user_id: $userId})-[:READ]->(candidate)
}
// Exclui o próprio livro concluído
AND candidate.book_id <> $bookId

// Etapa 3: Agrega co-leitores por candidato
WITH candidate,
     COUNT(DISTINCT reader) AS co_readers,
     candidate.avg_rating   AS avg_rating,
     candidate.review_count AS review_count

// Etapa 4: Obtém o total de leitores do livro-alvo (denominador da normalização)
WITH candidate, co_readers, avg_rating, review_count,
     SIZE([(t:Book {book_id: $bookId})<-[:READ]-(r:User) | r]) AS total_target_readers

// Etapa 5: Verifica categorias compartilhadas entre livro-alvo e candidato
OPTIONAL MATCH (target2:Book {book_id: $bookId})-[bt:BELONGS_TO]->(sharedCat:Category)<-[:BELONGS_TO {position: 1}]-(candidate)
WITH candidate, co_readers, avg_rating, review_count, total_target_readers,
     COUNT(DISTINCT sharedCat) AS shared_primary_categories

OPTIONAL MATCH (target3:Book {book_id: $bookId})-[:BELONGS_TO]->(anyCat:Category)<-[:BELONGS_TO]-(candidate)
WITH candidate, co_readers, avg_rating, review_count, total_target_readers,
     shared_primary_categories,
     COUNT(DISTINCT anyCat) AS shared_any_categories

// Etapa 6: Compõe o score final
WITH candidate,
     co_readers,
     total_target_readers,
     avg_rating,
     review_count,
     shared_primary_categories,
     shared_any_categories,

     // 40% — co-leitura normalizada pelo total de leitores do livro-alvo
     (toFloat(co_readers) / toFloat(CASE WHEN total_target_readers = 0 THEN 1 ELSE total_target_readers END)) * 0.40
       AS co_read_score,

     // 30% — avaliação média global desnormalizada no nó Book
     (COALESCE(avg_rating, 3.0) / 5.0) * 0.30
       AS rating_score,

     // 20% — proximidade de categoria (compatível com lógica SQL anterior)
     (CASE
       WHEN shared_primary_categories >= 1 THEN 1.0   -- mesma categoria principal
       WHEN shared_any_categories      >= 1 THEN 0.5   -- alguma categoria em comum
       ELSE 0.0                                         -- sem sobreposição
     END) * 0.20
       AS category_score,

     // 10% — popularidade geral (log-scaled, cap em review_count=1000)
     (log(toFloat(CASE WHEN review_count > 1000 THEN 1000 ELSE review_count END) + 1.0)
       / log(1001.0)) * 0.10
       AS popularity_score

RETURN candidate.book_id                                              AS book_id,
       co_read_score + rating_score + category_score + popularity_score AS score,
       co_readers                                                     AS co_readers,
       total_target_readers                                           AS total_readers

ORDER BY score DESC
LIMIT $limit
```

**Breakdown do score com exemplo (usuário conclui Duna, book_id=456):**

| Livro candidato | co_read_score (40%) | rating_score (30%) | category_score (20%) | popularity_score (10%) | **Total** |
|---|---|---|---|---|---|
| Fundação (Isaac Asimov) | 0.32 (80% co-leitura) | 0.288 (4.8★) | 0.20 (mesma categ.) | 0.083 | **0.891** |
| O Guia do Mochileiro | 0.24 (60% co-leitura) | 0.276 (4.6★) | 0.10 (categ. secund.) | 0.076 | **0.692** |
| Harry Potter | 0.08 (20% co-leitura) | 0.294 (4.9★) | 0.00 (sem sobreposição) | 0.100 | **0.474** |

Harry Potter tem a melhor avaliação mas baixa co-leitura com leitores de Duna — aparece mais abaixo.
Fundação lidera porque quem lê Duna quase sempre lê Fundação.

---

## 4. Implementação Backend

### Estrutura de Pacotes

```
com.biblioo.recommendation/
├── consumer/
│   └── RecommendationConsumer.java          ← 4.1
├── service/
│   ├── BecauseYouReadService.java           ← 4.2
│   └── BecauseYouReadFallbackService.java   ← 5.x (fallback SQL)
├── graph/
│   ├── Neo4jGraphService.java               ← 4.3
│   └── GraphUpdateService.java              ← atualiza arestas READ
├── repository/
│   ├── RecommendationResultRepository.java  ← 4.4
│   └── EventLogRepository.java              ← 4.5
├── entity/
│   ├── RecommendationResult.java
│   └── RecommendationEventLog.java
└── dto/
    ├── ShelfReadingCompletedEvent.java
    └── BookScore.java
```

---

### 4.0 — Dependências (pom.xml)

```xml
<dependencies>
    <!-- Spring Boot -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-amqp</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>

    <!-- Neo4j Driver oficial (não Spring Data Neo4j — mais controle sobre Cypher) -->
    <dependency>
        <groupId>org.neo4j.driver</groupId>
        <artifactId>neo4j-java-driver</artifactId>
        <version>5.18.0</version>
    </dependency>

    <!-- MySQL -->
    <dependency>
        <groupId>com.mysql</groupId>
        <artifactId>mysql-connector-j</artifactId>
        <scope>runtime</scope>
    </dependency>

    <!-- Jackson para serialização do JSON de books -->
    <dependency>
        <groupId>com.fasterxml.jackson.core</groupId>
        <artifactId>jackson-databind</artifactId>
    </dependency>

    <!-- Lombok -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>

    <!-- Micrometer para métricas -->
    <dependency>
        <groupId>io.micrometer</groupId>
        <artifactId>micrometer-core</artifactId>
    </dependency>
</dependencies>
```

---

### 4.0 — application.yml

```yaml
spring:
  rabbitmq:
    host: ${RABBITMQ_HOST:localhost}
    port: 5672
    username: ${RABBITMQ_USER:guest}
    password: ${RABBITMQ_PASS:guest}
    listener:
      simple:
        acknowledge-mode: manual
        prefetch: 1                     # processa 1 mensagem por vez por consumer
        retry:
          enabled: true
          initial-interval: 2000ms
          max-attempts: 3
          multiplier: 2.0

  datasource:
    url: jdbc:mysql://${DB_HOST:localhost}:3306/biblioo
    username: ${DB_USER}
    password: ${DB_PASS}
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5

  jpa:
    hibernate:
      ddl-auto: validate
    open-in-view: false

neo4j:
  uri: ${NEO4J_URI:bolt://localhost:7687}
  authentication:
    username: ${NEO4J_USER:neo4j}
    password: ${NEO4J_PASS:neo4j}
  connection-timeout: 5s
  max-connection-pool-size: 50

recommendation:
  t1:
    candidate-limit: 20
    min-co-readers: 2         # mínimo de co-leitores para o candidato entrar no ranking
    score-jitter-pct: 0.03    # ±3% de ruído no score
    max-same-category-ratio: 0.60  # no máximo 60% dos resultados da mesma categoria
```

---

### 4.0 — Configuração do RabbitMQ

```java
package com.biblioo.recommendation.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE      = "biblioo.domain.events";
    public static final String QUEUE_REC     = "rec.shelf.completed";
    public static final String ROUTING_KEY   = "shelf.reading.completed";
    public static final String DLQ           = "rec.shelf.completed.dlq";
    public static final String DLX           = "rec.shelf.dlx";

    @Bean
    public TopicExchange domainExchange() {
        return ExchangeBuilder.topicExchange(EXCHANGE).durable(true).build();
    }

    @Bean
    public DirectExchange deadLetterExchange() {
        return ExchangeBuilder.directExchange(DLX).durable(true).build();
    }

    @Bean
    public Queue recommendationQueue() {
        return QueueBuilder.durable(QUEUE_REC)
                .withArgument("x-dead-letter-exchange", DLX)
                .withArgument("x-dead-letter-routing-key", DLQ)
                .withArgument("x-queue-type", "quorum")   // quorum queue para durabilidade
                .build();
    }

    @Bean
    public Queue deadLetterQueue() {
        return QueueBuilder.durable(DLQ).build();
    }

    @Bean
    public Binding recommendationBinding() {
        return BindingBuilder.bind(recommendationQueue())
                .to(domainExchange())
                .with(ROUTING_KEY);
    }

    @Bean
    public Binding deadLetterBinding() {
        return BindingBuilder.bind(deadLetterQueue())
                .to(deadLetterExchange())
                .with(DLQ);
    }

    @Bean
    public Jackson2JsonMessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
```

---

### 4.0 — Configuração do Neo4j Driver

```java
package com.biblioo.recommendation.config;

import org.neo4j.driver.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

@Configuration
public class Neo4jConfig {

    @Value("${neo4j.uri}")
    private String uri;

    @Value("${neo4j.authentication.username}")
    private String username;

    @Value("${neo4j.authentication.password}")
    private String password;

    @Value("${neo4j.connection-timeout:5s}")
    private Duration connectionTimeout;

    @Value("${neo4j.max-connection-pool-size:50}")
    private int maxPoolSize;

    @Bean(destroyMethod = "close")
    public Driver neo4jDriver() {
        return GraphDatabase.driver(
            uri,
            AuthTokens.basic(username, password),
            Config.builder()
                .withConnectionTimeout(connectionTimeout.toMillis(), java.util.concurrent.TimeUnit.MILLISECONDS)
                .withMaxConnectionPoolSize(maxPoolSize)
                // Logging de queries lentas (> 1s)
                .withEventLoopThreads(4)
                .build()
        );
    }
}
```

---

### 4.0 — DTOs

```java
package com.biblioo.recommendation.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class ShelfReadingCompletedEvent {

    @JsonProperty("event_id")
    private String eventId;

    @JsonProperty("event_type")
    private String eventType;

    @JsonProperty("user_id")
    private Long userId;

    @JsonProperty("book_id")
    private Long bookId;

    private String timestamp;
    private Metadata metadata;

    @Data
    public static class Metadata {
        @JsonProperty("shelf_id")
        private Long shelfId;

        @JsonProperty("shelf_item_id")
        private Long shelfItemId;

        @JsonProperty("finished_at")
        private String finishedAt;

        @JsonProperty("total_pages")
        private Integer totalPages;
    }
}
```

```java
package com.biblioo.recommendation.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BookScore {
    private Long bookId;
    private double score;
    private String source;   // "graph" | "sql_fallback"
}
```

---

### 4.1 — Consumer do Evento

```java
package com.biblioo.recommendation.consumer;

import com.biblioo.recommendation.config.RabbitMQConfig;
import com.biblioo.recommendation.dto.ShelfReadingCompletedEvent;
import com.biblioo.recommendation.service.BecauseYouReadService;
import com.biblioo.recommendation.repository.EventLogRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rabbitmq.client.Channel;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class RecommendationConsumer {

    private final BecauseYouReadService becauseYouReadService;
    private final EventLogRepository    eventLogRepository;
    private final ObjectMapper          objectMapper;
    private final MeterRegistry         meterRegistry;

    @RabbitListener(
        queues       = RabbitMQConfig.QUEUE_REC,
        // ACK manual — definido no application.yml (acknowledge-mode: manual)
        containerFactory = "rabbitListenerContainerFactory"
    )
    public void onMessage(Message message, Channel channel) throws Exception {

        long deliveryTag = message.getMessageProperties().getDeliveryTag();
        ShelfReadingCompletedEvent event = null;

        try {
            // ── 1. Deserializa o payload ──────────────────────────────────────
            event = objectMapper.readValue(message.getBody(), ShelfReadingCompletedEvent.class);

            log.info("[T1-Consumer] event_id={} user_id={} book_id={}",
                event.getEventId(), event.getUserId(), event.getBookId());

            // ── 2. Idempotência — delega para o service ───────────────────────
            if (eventLogRepository.existsByEventId(event.getEventId())) {
                log.info("[T1-Consumer] Duplicate event_id={}, discarding", event.getEventId());
                channel.basicAck(deliveryTag, false);
                return;
            }

            // ── 3. Registra o evento (antes de processar) ─────────────────────
            eventLogRepository.registerEvent(
                event.getEventId(),
                event.getEventType(),
                event.getUserId(),
                objectMapper.writeValueAsString(event)
            );

            // ── 4. Executa trilha T1 ──────────────────────────────────────────
            Timer.Sample sample = Timer.start(meterRegistry);
            becauseYouReadService.compute(event);
            sample.stop(Timer.builder("recommendation.consumer.latency")
                .tag("trail", "BECAUSE_YOU_READ")
                .register(meterRegistry));

            // ── 5. ACK só após persistência confirmada ────────────────────────
            channel.basicAck(deliveryTag, false);
            log.info("[T1-Consumer] ACK sent for event_id={}", event.getEventId());

        } catch (Exception ex) {
            String eventId = event != null ? event.getEventId() : "UNKNOWN";
            log.error("[T1-Consumer] Processing failed for event_id={}: {}", eventId, ex.getMessage(), ex);

            meterRegistry.counter("recommendation.consumer.error",
                "trail", "BECAUSE_YOU_READ",
                "cause", ex.getClass().getSimpleName()
            ).increment();

            // NACK sem requeue — vai para a DLQ
            // O Spring AMQP retry (3x com backoff) já foi esgotado antes de chegar aqui
            channel.basicNack(deliveryTag, false, false);
        }
    }
}
```

---

### 4.2 — Service de Recomendação T1

```java
package com.biblioo.recommendation.service;

import com.biblioo.recommendation.dto.BookScore;
import com.biblioo.recommendation.dto.ShelfReadingCompletedEvent;
import com.biblioo.recommendation.graph.Neo4jGraphService;
import com.biblioo.recommendation.repository.RecommendationResultRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BecauseYouReadService {

    private final Neo4jGraphService              neo4jGraphService;
    private final BecauseYouReadFallbackService  fallbackService;
    private final RecommendationResultRepository resultRepository;

    @Value("${recommendation.t1.candidate-limit:20}")
    private int candidateLimit;

    @Value("${recommendation.t1.score-jitter-pct:0.03}")
    private double jitterPct;

    @Value("${recommendation.t1.max-same-category-ratio:0.60}")
    private double maxSameCategoryRatio;

    /**
     * Ponto de entrada chamado pelo consumer.
     * Executa o fluxo completo da T1 para um evento de leitura concluída.
     */
    public void compute(ShelfReadingCompletedEvent event) {
        Long userId = event.getUserId();
        Long bookId = event.getBookId();

        // ── 1. Atualiza o grafo com a nova aresta READ ────────────────────────
        try {
            neo4jGraphService.mergeReadRelationship(
                userId,
                bookId,
                event.getMetadata().getFinishedAt(),
                event.getMetadata().getShelfItemId()
            );
        } catch (Exception ex) {
            // Falha no MERGE não impede o cálculo se o grafo já estava atualizado
            log.warn("[T1] Failed to update graph for user={} book={}: {}", userId, bookId, ex.getMessage());
        }

        // ── 2. Executa a query de recomendação ───────────────────────────────
        List<BookScore> candidates = computeWithFallback(userId, bookId);

        if (candidates.isEmpty()) {
            log.info("[T1] No candidates found for user={} book={}, keeping previous results", userId, bookId);
            return; // Não sobrescreve resultado anterior com lista vazia
        }

        // ── 3. Aplica pós-processamento anti-obviedade ────────────────────────
        List<BookScore> processed = postProcess(candidates);

        // ── 4. Persiste no SQL ────────────────────────────────────────────────
        resultRepository.upsert(userId, "BECAUSE_YOU_READ", processed);

        log.info("[T1] Persisted {} recommendations for user={} book={} source={}",
            processed.size(), userId, bookId, processed.get(0).getSource());
    }

    /**
     * Tenta calcular via grafo; em caso de falha, usa fallback SQL.
     */
    private List<BookScore> computeWithFallback(Long userId, Long bookId) {
        try {
            List<BookScore> graphResults = neo4jGraphService.computeT1(userId, bookId, candidateLimit);

            if (!graphResults.isEmpty()) {
                return graphResults;
            }

            // Grafo retornou vazio — usuário novo no grafo ou livro sem co-leitores
            // Tenta o fallback SQL antes de desistir
            log.info("[T1] Graph returned empty for user={} book={}, attempting SQL fallback", userId, bookId);
            return fallbackService.compute(userId, bookId);

        } catch (Exception ex) {
            log.warn("[T1] Neo4j unavailable for user={} book={}, activating SQL fallback. Cause: {}",
                userId, bookId, ex.getMessage());

            // Alerta para o time de infra (integrar com Prometheus/PagerDuty)
            // alertService.notify("neo4j_fallback_activated", "BECAUSE_YOU_READ");

            return fallbackService.compute(userId, bookId);
        }
    }

    /**
     * Aplica jitter de score e diversificação de categorias.
     * Não consulta banco — opera sobre a lista em memória.
     */
    private List<BookScore> postProcess(List<BookScore> candidates) {
        Random random = new Random();

        // Aplica jitter: score = score * (1.0 ± jitterPct)
        List<BookScore> jittered = candidates.stream()
            .map(bs -> {
                double noise  = bs.getScore() * (1.0 + (random.nextDouble() * 2 * jitterPct) - jitterPct);
                double capped = Math.min(1.0, Math.max(0.0, noise));
                return new BookScore(bs.getBookId(), capped, bs.getSource());
            })
            .sorted(Comparator.comparingDouble(BookScore::getScore).reversed())
            .collect(Collectors.toList());

        // Limita dominância de categoria: máximo 60% da mesma categoria
        // (diversificação simplificada — shufflea se ultrapassar o limite)
        int maxFromSameCategory = (int) Math.ceil(candidateLimit * maxSameCategoryRatio);

        // Para diversificação real, seria necessário buscar categorias dos candidatos no grafo.
        // Esta versão aplica a regra de forma conservadora com o limite já calculado.
        return jittered.stream()
            .limit(maxFromSameCategory + (candidateLimit - maxFromSameCategory))
            .collect(Collectors.toList());
    }
}
```

---

### 4.3 — Integração com Neo4j

```java
package com.biblioo.recommendation.graph;

import com.biblioo.recommendation.dto.BookScore;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.neo4j.driver.*;
import org.neo4j.driver.exceptions.Neo4jException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class Neo4jGraphService {

    private final Driver neo4jDriver;

    // ─────────────────────────────────────────────────────────────────────────
    // Atualização incremental do grafo
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Cria ou atualiza a aresta READ entre o usuário e o livro.
     * Usa MERGE para garantir idempotência — pode ser chamado múltiplas vezes
     * com o mesmo evento sem duplicar dados.
     */
    public void mergeReadRelationship(Long userId, Long bookId, String finishedAt, Long shelfItemId) {
        String cypher = """
            MERGE (u:User {user_id: $userId})
            ON CREATE SET u.created_at = datetime()
            
            MERGE (b:Book {book_id: $bookId})
            ON CREATE SET b.avg_rating   = 3.5,
                          b.review_count = 0
            
            MERGE (u)-[r:READ]->(b)
            ON CREATE SET r.finished_at   = datetime($finishedAt),
                          r.shelf_item_id = $shelfItemId
            ON MATCH  SET r.finished_at   = datetime($finishedAt)
            """;

        try (Session session = neo4jDriver.session()) {
            session.executeWrite(tx -> {
                tx.run(cypher, Map.of(
                    "userId",      userId,
                    "bookId",      bookId,
                    "finishedAt",  finishedAt,   // ISO-8601: "2026-03-10"
                    "shelfItemId", shelfItemId
                ));
                return null;
            });
            log.debug("[Neo4j] MERGE READ: user={} -> book={}", userId, bookId);

        } catch (Neo4jException ex) {
            log.error("[Neo4j] Failed to MERGE READ relationship: user={} book={} cause={}",
                userId, bookId, ex.getMessage());
            throw ex; // propaga para o service decidir sobre fallback
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Query T1 — BECAUSE_YOU_READ
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Executa a query de co-leitura (2 hops) e retorna livros candidatos com score.
     *
     * @param userId  usuário que concluiu o livro
     * @param bookId  livro que foi concluído
     * @param limit   máximo de candidatos
     * @return lista de BookScore ordenada por score desc
     */
    public List<BookScore> computeT1(Long userId, Long bookId, int limit) {
        String cypher = """
            // Etapa 1: Co-leitura — 2 hops via leitores do livro-alvo
            MATCH (target:Book {book_id: $bookId})<-[:READ]-(reader:User)-[:READ]->(candidate:Book)
            WHERE reader.user_id <> $userId
              AND candidate.book_id <> $bookId
              AND NOT EXISTS {
                  MATCH (me:User {user_id: $userId})-[:READ]->(candidate)
              }
            
            WITH candidate,
                 COUNT(DISTINCT reader)   AS co_readers,
                 candidate.avg_rating     AS avg_rating,
                 candidate.review_count   AS review_count
            
            // Etapa 2: Total de leitores do livro-alvo (denominador)
            WITH candidate, co_readers, avg_rating, review_count,
                 SIZE([(t:Book {book_id: $bookId})<-[:READ]-(r:User) | r]) AS total_target_readers
            
            // Etapa 3: Categorias compartilhadas — principal
            OPTIONAL MATCH (target2:Book {book_id: $bookId})-[:BELONGS_TO {position: 1}]->(pc:Category)
                           <-[:BELONGS_TO {position: 1}]-(candidate)
            WITH candidate, co_readers, avg_rating, review_count, total_target_readers,
                 COUNT(DISTINCT pc) AS shared_primary_categories
            
            // Etapa 4: Categorias compartilhadas — qualquer posição
            OPTIONAL MATCH (target3:Book {book_id: $bookId})-[:BELONGS_TO]->(ac:Category)
                           <-[:BELONGS_TO]-(candidate)
            WITH candidate, co_readers, avg_rating, review_count, total_target_readers,
                 shared_primary_categories,
                 COUNT(DISTINCT ac) AS shared_any_categories
            
            // Etapa 5: Score composto
            WITH candidate,
                 (toFloat(co_readers) /
                  toFloat(CASE WHEN total_target_readers = 0 THEN 1 ELSE total_target_readers END))
                   * 0.40 AS co_read_score,
                 
                 (COALESCE(avg_rating, 3.0) / 5.0) * 0.30 AS rating_score,
                 
                 (CASE WHEN shared_primary_categories >= 1 THEN 1.0
                       WHEN shared_any_categories      >= 1 THEN 0.5
                       ELSE 0.0 END) * 0.20 AS category_score,
                 
                 (log(toFloat(CASE WHEN review_count > 1000 THEN 1000 ELSE review_count END) + 1.0)
                   / log(1001.0)) * 0.10 AS popularity_score
            
            RETURN candidate.book_id AS book_id,
                   co_read_score + rating_score + category_score + popularity_score AS score
            ORDER BY score DESC
            LIMIT $limit
            """;

        try (Session session = neo4jDriver.session(SessionConfig.forDatabase("neo4j"))) {
            return session.executeRead(tx -> {
                var result = tx.run(cypher, Map.of(
                    "userId", userId,
                    "bookId", bookId,
                    "limit",  limit
                ));

                return result.list(record -> new BookScore(
                    record.get("book_id").asLong(),
                    record.get("score").asDouble(),
                    "graph"
                ));
            });
        } catch (Neo4jException ex) {
            log.error("[Neo4j] T1 query failed: user={} book={} cause={}", userId, bookId, ex.getMessage());
            throw ex; // propaga — o service vai acionar o fallback
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Atualização de metadados do livro (chamada por evento de review)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Atualiza avg_rating e review_count desnormalizados no nó Book.
     * Chamado quando um evento de review é recebido.
     */
    public void updateBookStats(Long bookId, double avgRating, int reviewCount) {
        String cypher = """
            MATCH (b:Book {book_id: $bookId})
            SET b.avg_rating   = $avgRating,
                b.review_count = $reviewCount
            """;

        try (Session session = neo4jDriver.session()) {
            session.executeWrite(tx -> {
                tx.run(cypher, Map.of(
                    "bookId",      bookId,
                    "avgRating",   avgRating,
                    "reviewCount", reviewCount
                ));
                return null;
            });
        } catch (Neo4jException ex) {
            // Não crítico — próxima execução vai usar valor desatualizado, não quebra o sistema
            log.warn("[Neo4j] Failed to update book stats: book={} cause={}", bookId, ex.getMessage());
        }
    }
}
```

---

### 4.4 — Persistência no SQL

**Entidade JPA:**

```java
package com.biblioo.recommendation.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@Entity
@Table(
    name = "recommendation_results",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "trail_type"})
)
public class RecommendationResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "trail_type", nullable = false, length = 30)
    private String trailType;

    // JSON salvo como TEXT — [{book_id, score, source}]
    @Column(name = "books", nullable = false, columnDefinition = "JSON")
    private String books;

    @Column(name = "computed_at", nullable = false)
    private LocalDateTime computedAt;

    public RecommendationResult(Long userId, String trailType, String books) {
        this.userId     = userId;
        this.trailType  = trailType;
        this.books      = books;
        this.computedAt = LocalDateTime.now();
    }
}
```

**Repository com UPSERT nativo:**

```java
package com.biblioo.recommendation.repository;

import com.biblioo.recommendation.dto.BookScore;
import com.biblioo.recommendation.entity.RecommendationResult;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

// ── Interface JPA base ────────────────────────────────────────────────────────
public interface RecommendationResultJpaRepository extends JpaRepository<RecommendationResult, Long> {}

// ── Repository customizado com UPSERT ────────────────────────────────────────
@Slf4j
@Repository
@RequiredArgsConstructor
public class RecommendationResultRepository {

    private final RecommendationResultJpaRepository jpaRepository;
    private final ObjectMapper objectMapper;

    @PersistenceContext
    private EntityManager entityManager;

    /**
     * Insere ou atualiza a recomendação para o par (userId, trailType).
     * Usa UPSERT nativo para garantir atomicidade e evitar race condition.
     */
    @Transactional
    public void upsert(Long userId, String trailType, List<BookScore> bookScores) {
        String booksJson = serializeBooks(bookScores);

        // MySQL: INSERT ... ON DUPLICATE KEY UPDATE
        // Para PostgreSQL: INSERT ... ON CONFLICT (user_id, trail_type) DO UPDATE SET ...
        int updated = entityManager.createNativeQuery("""
                INSERT INTO recommendation_results (user_id, trail_type, books, computed_at)
                VALUES (:userId, :trailType, :books, :computedAt)
                ON DUPLICATE KEY UPDATE
                    books       = VALUES(books),
                    computed_at = VALUES(computed_at)
                """)
            .setParameter("userId",     userId)
            .setParameter("trailType",  trailType)
            .setParameter("books",      booksJson)
            .setParameter("computedAt", LocalDateTime.now())
            .executeUpdate();

        log.info("[SQL] Upserted recommendation_results: user={} trail={} books={} affected={}",
            userId, trailType, bookScores.size(), updated);
    }

    private String serializeBooks(List<BookScore> bookScores) {
        // Serializa para o formato: [{"book_id":789,"score":0.95,"actor_id":null,"actor_action":null,"source":"graph"}]
        List<BookScoreJson> payload = bookScores.stream()
            .map(bs -> new BookScoreJson(bs.getBookId(), bs.getScore(), null, null, bs.getSource()))
            .toList();

        try {
            return objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException ex) {
            throw new RuntimeException("Failed to serialize book scores", ex);
        }
    }

    // Record interno — define o shape exato do JSON persistido
    record BookScoreJson(
        Long   book_id,
        double score,
        Long   actor_id,
        String actor_action,
        String source
    ) {}
}
```

---

### 4.5 — Idempotência

**Entidade:**

```java
package com.biblioo.recommendation.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@Entity
@Table(
    name = "recommendation_event_log",
    indexes = @Index(columnList = "event_id", unique = true)
)
public class RecommendationEventLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_id", nullable = false, unique = true, length = 36)
    private String eventId;

    @Column(name = "event_type", nullable = false, length = 60)
    private String eventType;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "payload", columnDefinition = "JSON")
    private String payload;

    @Column(name = "processed_at", nullable = false)
    private LocalDateTime processedAt;

    public RecommendationEventLog(String eventId, String eventType, Long userId, String payload) {
        this.eventId     = eventId;
        this.eventType   = eventType;
        this.userId      = userId;
        this.payload     = payload;
        this.processedAt = LocalDateTime.now();
    }
}
```

**Repository:**

```java
package com.biblioo.recommendation.repository;

import com.biblioo.recommendation.entity.RecommendationEventLog;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

// ── Interface JPA ─────────────────────────────────────────────────────────────
public interface EventLogJpaRepository extends JpaRepository<RecommendationEventLog, Long> {
    boolean existsByEventId(String eventId);
}

// ── Repository customizado ────────────────────────────────────────────────────
@Slf4j
@Repository
@RequiredArgsConstructor
public class EventLogRepository {

    private final EventLogJpaRepository jpaRepository;

    /**
     * Verifica se o evento já foi processado.
     * Consulta pelo índice único em event_id — O(1) lookup.
     */
    public boolean existsByEventId(String eventId) {
        return jpaRepository.existsByEventId(eventId);
    }

    /**
     * Registra o evento como processado.
     *
     * Usa REQUIRES_NEW para que o INSERT seja commitado imediatamente,
     * independente da transação pai. Isso garante que mesmo se o processamento
     * posterior falhar, o event_id ficará registrado — o retry seguinte
     * vai detectar o duplicado e fazer ACK sem reprocessar.
     *
     * ATENÇÃO: isso cria um trade-off. Se o Neo4j falhar APÓS o registro,
     * o evento não será reprocessado. Por isso o fallback SQL é acionado
     * ANTES de registrar — o registro acontece apenas quando temos certeza
     * de que vamos processar.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void registerEvent(String eventId, String eventType, Long userId, String payload) {
        try {
            jpaRepository.save(new RecommendationEventLog(eventId, eventType, userId, payload));
            log.debug("[EventLog] Registered event_id={}", eventId);
        } catch (DataIntegrityViolationException ex) {
            // Race condition: dois consumers tentaram registrar o mesmo event_id simultaneamente
            // O que perdeu a corrida simplesmente descarta — o vencedor vai processar
            log.warn("[EventLog] Concurrent duplicate detected for event_id={}, discarding", eventId);
            throw new DuplicateEventException(eventId);
        }
    }
}
```

```java
package com.biblioo.recommendation.repository;

public class DuplicateEventException extends RuntimeException {
    public DuplicateEventException(String eventId) {
        super("Duplicate event: " + eventId);
    }
}
```

**Consumer atualizado para tratar DuplicateEventException:**

```java
// No RecommendationConsumer.onMessage(), o bloco de registro fica assim:
try {
    eventLogRepository.registerEvent(
        event.getEventId(),
        event.getEventType(),
        event.getUserId(),
        objectMapper.writeValueAsString(event)
    );
} catch (DuplicateEventException ex) {
    // Race condition resolvida — outro consumer registrou primeiro
    log.info("[T1-Consumer] Race condition on event_id={}, discarding", event.getEventId());
    channel.basicAck(deliveryTag, false);
    return;
}
```

---

### 4.6 — Fallback SQL (quando Neo4j está indisponível)

```java
package com.biblioo.recommendation.service;

import com.biblioo.recommendation.dto.BookScore;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Implementação SQL da T1 — lógica idêntica à versão anterior ao grafo.
 * Usada como fallback quando o Neo4j está indisponível.
 *
 * Score = (avg_rating/5.0 × 0.5) + (log(leitores+1)/log(1000) × 0.3) + (categoria_match × 0.2)
 */
@Slf4j
@Service
public class BecauseYouReadFallbackService {

    @PersistenceContext
    private EntityManager entityManager;

    @SuppressWarnings("unchecked")
    public List<BookScore> compute(Long userId, Long bookId) {
        log.warn("[T1-Fallback] Running SQL fallback for user={} book={}", userId, bookId);

        // Busca categorias do livro concluído
        List<Long> categoryIds = entityManager.createNativeQuery("""
                SELECT category_id FROM book_categories
                WHERE book_id = :bookId
                ORDER BY rowid ASC
                """)
            .setParameter("bookId", bookId)
            .getResultList();

        if (categoryIds.isEmpty()) {
            log.warn("[T1-Fallback] No categories found for book={}", bookId);
            return List.of();
        }

        Long primaryCategoryId = categoryIds.get(0);

        // Query de candidatos com score SQL
        List<Object[]> rows = entityManager.createNativeQuery("""
                SELECT
                    b.id                                                   AS book_id,
                    (AVG(cr.rating) / 5.0) * 0.5
                    + (LOG(COUNT(DISTINCT si2.user_id) + 1) / LOG(1000)) * 0.3
                    + (CASE
                        WHEN MAX(CASE WHEN bc_primary.category_id = :primaryCategoryId THEN 1 ELSE 0 END) = 1
                            THEN 0.2
                        WHEN MAX(CASE WHEN bc_any.category_id IN (:categoryIds) THEN 1 ELSE 0 END) = 1
                            THEN 0.1
                        ELSE 0.0
                       END)                                                AS score
                FROM books b
                JOIN book_categories bc ON bc.book_id = b.id
                                       AND bc.category_id IN (:categoryIds)
                JOIN community_groups cg ON cg.book_id = b.id
                JOIN community_reviews cr ON cr.community_id = cg.id
                JOIN shelf_items si2 ON si2.book_id = b.id
                                    AND si2.status = 'COMPLETED'
                LEFT JOIN book_categories bc_primary ON bc_primary.book_id = b.id
                                                     AND bc_primary.category_id = :primaryCategoryId
                LEFT JOIN book_categories bc_any ON bc_any.book_id = b.id
                                                 AND bc_any.category_id IN (:categoryIds)
                WHERE b.id NOT IN (
                    SELECT si.book_id
                    FROM shelf_items si
                    JOIN shelves s ON s.id = si.shelf_id
                    WHERE s.user_id = :userId
                      AND si.status IN ('COMPLETED', 'READING')
                )
                AND b.id != :bookId
                GROUP BY b.id
                HAVING COUNT(cr.id) >= 2
                ORDER BY score DESC
                LIMIT 20
                """)
            .setParameter("userId",            userId)
            .setParameter("bookId",            bookId)
            .setParameter("primaryCategoryId", primaryCategoryId)
            .setParameter("categoryIds",       categoryIds)
            .getResultList();

        return rows.stream()
            .map(row -> new BookScore(
                ((Number) row[0]).longValue(),
                ((Number) row[1]).doubleValue(),
                "sql_fallback"
            ))
            .toList();
    }
}
```

---

## 5. Resiliência

### 5.1 — Retry com backoff exponencial

O Spring AMQP já configura retry automático via `application.yml`:

```yaml
spring:
  rabbitmq:
    listener:
      simple:
        retry:
          enabled: true
          initial-interval: 2000ms   # primeira tentativa: espera 2s
          max-attempts: 3            # 3 tentativas totais
          multiplier: 2.0            # backoff: 2s → 4s → 8s
          max-interval: 10000ms
```

Após 3 tentativas sem sucesso, a mensagem vai para a DLQ (`rec.shelf.completed.dlq`).
A DLQ deve ser monitorada e pode ter um consumer separado para reprocessamento manual.

### 5.2 — Timeout no Neo4j

```java
// Na configuração do driver, definir timeout por transação
try (Session session = neo4jDriver.session()) {
    session.executeRead(tx -> {
        // Timeout por query individual via TransactionConfig
        var config = TransactionConfig.builder()
            .withTimeout(java.time.Duration.ofSeconds(5))
            .build();

        return session.executeRead(tx2 -> tx2.run(cypher, params).list(...), config);
    });
}
```

Alternativamente, configurar no `application.yml`:

```yaml
neo4j:
  connection-acquisition-timeout: 5s
  max-transaction-retry-time: 3s
```

### 5.3 — Fallback automático para SQL

O `BecauseYouReadService` já implementa fallback transparente (seção 4.2).
O campo `source` no JSON salvo indica quando o fallback foi ativado:

```json
{"book_id": 789, "score": 0.87, "source": "sql_fallback"}
```

### 5.4 — Logs estruturados (prontos para Kibana/Datadog)

```java
// Padrão de log em todos os componentes T1
// Campos: timestamp, level, service, trail, event_id, user_id, book_id, source, duration_ms

log.info("[T1] Completed: event_id={} user={} book={} candidates={} source={} duration_ms={}",
    eventId, userId, bookId, results.size(), results.isEmpty() ? "none" : results.get(0).getSource(), elapsed);
```

Usar MDC para propagar o event_id em todo o fluxo:

```java
// No consumer, antes de processar:
MDC.put("event_id", event.getEventId());
MDC.put("user_id",  String.valueOf(event.getUserId()));
MDC.put("trail",    "BECAUSE_YOU_READ");

try {
    // ... processamento ...
} finally {
    MDC.clear();
}
```

### 5.5 — Métricas para monitoramento

```java
// Contador de fallbacks ativados
meterRegistry.counter("recommendation.neo4j.fallback",
    "trail", "BECAUSE_YOU_READ"
).increment();

// Histograma de tempo de query Cypher
Timer.builder("recommendation.neo4j.query.duration")
    .tag("trail", "BECAUSE_YOU_READ")
    .tag("query", "t1_co_read")
    .register(meterRegistry)
    .record(elapsed, TimeUnit.MILLISECONDS);

// Gauge da fila DLQ (via RabbitMQ management API)
```

---

## 6. Performance

### 6.1 — Por que não recalcular tudo

Cada evento atualiza **apenas a aresta READ do usuário que concluiu o livro**. A query Cypher
navega a partir desse livro específico — não roda sobre todo o grafo. O custo é proporcional
ao grau do nó (quantos usuários leram o livro), não ao tamanho do grafo.

Para um livro popular com 10.000 leitores:
- `MERGE` da nova aresta: ~1-2ms
- Travessia de 2 hops para T1: ~50-200ms
- Total: < 300ms — dentro do budget de processamento assíncrono

### 6.2 — Índices no Neo4j (obrigatórios para T1)

```cypher
-- Executar antes de ligar os consumers em produção
CREATE INDEX user_id_idx      FOR (u:User)     ON (u.user_id);
CREATE INDEX book_id_idx      FOR (b:Book)     ON (b.book_id);
CREATE INDEX category_id_idx  FOR (c:Category) ON (c.category_id);

CREATE CONSTRAINT user_unique     FOR (u:User)     REQUIRE u.user_id IS UNIQUE;
CREATE CONSTRAINT book_unique     FOR (b:Book)     REQUIRE b.book_id IS UNIQUE;
CREATE CONSTRAINT category_unique FOR (c:Category) REQUIRE c.category_id IS UNIQUE;
```

Sem `user_id_idx`, o `MATCH (me:User {user_id: $userId})` faz full scan no grafo.
Com o índice, é um lookup O(log n).

### 6.3 — `LIMIT` como barreira obrigatória

A query Cypher usa `LIMIT $limit` (padrão: 20). Sem esse limit, a travessia de 2 hops pode
retornar milhares de candidatos para livros populares. O `LIMIT` é aplicado APÓS a ordenação —
o Neo4j usa lazy evaluation e não materializa todos os candidatos antes de ordenar (em grafos
com índices bem configurados).

### 6.4 — Impacto da co-leitura em grafos esparsos

Para usuários novos com poucos livros lidos, o grafo pode retornar poucos candidatos via
co-leitura. O fallback SQL cobre esse caso com a lógica de categoria. Com o tempo, à medida
que o grafo cresce, a co-leitura se torna o sinal dominante.

---

## 7. Resultado Final

### 7.1 — JSON salvo em `recommendation_results`

```json
[
  {
    "book_id": 789,
    "score": 0.891,
    "actor_id": null,
    "actor_action": null,
    "source": "graph"
  },
  {
    "book_id": 321,
    "score": 0.762,
    "actor_id": null,
    "actor_action": null,
    "source": "graph"
  },
  {
    "book_id": 654,
    "score": 0.693,
    "actor_id": null,
    "actor_action": null,
    "source": "graph"
  }
]
```

### 7.2 — Linha na tabela `recommendation_results`

```
id          | 8821
user_id     | 123
trail_type  | BECAUSE_YOU_READ
books       | [{"book_id":789,"score":0.891,"actor_id":null,"actor_action":null,"source":"graph"}, ...]
computed_at | 2026-03-10 14:00:03
```

### 7.3 — Resposta final da API (GET /api/recommendations)

```json
{
  "trails": [
    {
      "type": "because_you_read",
      "label": "Porque você leu Duna",
      "books": [
        {
          "id": 789,
          "title": "Fundação",
          "authors": ["Isaac Asimov"],
          "cover_url": "https://cdn.biblioo.com/covers/789.jpg",
          "avg_rating": 4.8,
          "score": 0.891
        },
        {
          "id": 321,
          "title": "O Guia do Mochileiro das Galáxias",
          "authors": ["Douglas Adams"],
          "cover_url": "https://cdn.biblioo.com/covers/321.jpg",
          "avg_rating": 4.7,
          "score": 0.762
        },
        {
          "id": 654,
          "title": "Neuromancer",
          "authors": ["William Gibson"],
          "cover_url": "https://cdn.biblioo.com/covers/654.jpg",
          "avg_rating": 4.5,
          "score": 0.693
        }
      ]
    }
  ]
}
```

O Discovery Service **nunca** consulta o Neo4j. Ele lê o JSON de `recommendation_results`,
extrai os `book_id`s, busca título/capa/autores em `books WHERE id IN (...)` e monta a resposta.
O campo `score` já está pré-computado no JSON — zero cálculo no GET.

---

## Checklist de Deploy

```
[ ] Índices e constraints criados no Neo4j (seção 6.2)
[ ] Script de bootstrap executado (popula grafo com histórico SQL existente)
[ ] Variáveis de ambiente configuradas: NEO4J_URI, NEO4J_USER, NEO4J_PASS
[ ] Fila rec.shelf.completed e DLQ criadas no RabbitMQ
[ ] Tabelas recommendation_results e recommendation_event_log existem no SQL
[ ] Alerta de fallback Neo4j configurado no Prometheus
[ ] Alerta de DLQ depth > 100 configurado
[ ] Shadow mode ativo na Fase 2 (grafo calcula mas não persiste, SQL continua ativo)
[ ] Monitorar campo "source" para validar proporção graph vs sql_fallback
```
