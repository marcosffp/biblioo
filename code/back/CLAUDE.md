# CLAUDE.md — Biblioo Backend

## 1. Visão Geral

Backend do **Biblioo**, uma rede social de leitura. Permite que usuários criem estantes de livros, escrevam reviews, sigam outros leitores, participem de comunidades (book clubs) com chat em tempo real, recebam notificações push/SSE e obtenham recomendações personalizadas baseadas em grafo.

**Tecnologias principais:**
- Java 25 + Spring Boot 4.0.4
- MySQL 8.4 (relacional), Neo4j 5.18 (grafo), Redis 7.4 (cache), OpenSearch 2.18 (busca full-text)
- RabbitMQ 4.0 (eventos de domínio + relay STOMP para WebSocket)
- Firebase Admin SDK 9.4.1 (FCM — push mobile), SSE (push web)
- Cloudinary (upload de imagens), Google Books API (enriquecimento de catálogo)

---

## 2. Estrutura de Pastas

```
code/back/
├── src/
│   ├── main/
│   │   ├── java/com/biblioo/
│   │   │   ├── BibliooApplication.java          # Entry point (@SpringBootApplication, @EnableAsync)
│   │   │   ├── config/                           # Configurações globais do Spring (CacheConfig, SecurityConfig, etc.)
│   │   │   ├── infrastructure/                   # Concerns transversais compartilhados por todos os módulos
│   │   │   │   ├── config/                       # OpenApiConfig, CloudinaryConfig, OpenSearchConfig
│   │   │   │   ├── external/cloudinary/          # CloudinaryService (upload/CDN)
│   │   │   │   ├── messaging/                    # RabbitMQConfig, OutboxEvent, adaptadores de mensageria
│   │   │   │   └── web/                          # WebConfig (CORS, logging de requests)
│   │   │   ├── books/                            # Módulo: catálogo de livros, estantes, coleções
│   │   │   │   ├── domain/
│   │   │   │   │   ├── model/                    # Book, Shelf, ShelfItem, Collection, Category, ReadingStatus
│   │   │   │   │   ├── port/in/                  # BookUseCase, ShelfUseCase (interfaces de entrada)
│   │   │   │   │   ├── port/out/                 # ShelfEventPublisherPort, MessageIdempotencyPort
│   │   │   │   │   ├── service/                  # BookService, ShelfService, CollectionService, BookEnrichService
│   │   │   │   │   └── exception/
│   │   │   │   └── infrasestructure/             # ATENÇÃO: typo intencional/histórico neste módulo
│   │   │   │       ├── web/                      # BookController, ShelfController, ShelfItemController, CollectionController
│   │   │   │       ├── persistence/              # BookRepository, ShelfRepository, ShelfItemRepository, CollectionRepository
│   │   │   │       ├── dto/book|shelf|shelfItem|collection/  # Request/Response DTOs
│   │   │   │       ├── dto/mapper/               # MapStruct mappers
│   │   │   │       ├── external/                 # GoogleBooksAdapter, GoogleBooksApiClient
│   │   │   │       ├── messaging/                # Adaptadores de eventos de leitura
│   │   │   │       ├── search/                   # SearchEngine (MySQL full-text)
│   │   │   │       └── config/                   # AsyncConfig, BookQueryHelper
│   │   │   ├── user/                             # Módulo: autenticação, perfis, follows, busca
│   │   │   │   ├── domain/
│   │   │   │   │   ├── model/                    # User
│   │   │   │   │   ├── port/in/                  # UserUseCase
│   │   │   │   │   ├── port/out/
│   │   │   │   │   └── service/                  # UserService, AuthService, FollowService
│   │   │   │   └── infrastructure/
│   │   │   │       ├── web/                      # AuthController, UserController
│   │   │   │       ├── persistence/              # UserRepository, FollowRepository
│   │   │   │       ├── security/                 # JwtAuthenticationFilter, JwtProvider, UserDetailsServiceAdapter
│   │   │   │       ├── auth/                     # Lógica complementar de autenticação
│   │   │   │       ├── cache/                    # UserCacheService (Redis, chave: user:{userId})
│   │   │   │       ├── async/                    # UserIndexingTask (indexação assíncrona)
│   │   │   │       ├── search/                   # UserSearchEngine (OpenSearch)
│   │   │   │       ├── external/                 # CloudinaryUploadAdapter (avatar/banner)
│   │   │   │       └── dto/mapper/
│   │   │   ├── feed/                             # Módulo: reviews, curtidas, comentários
│   │   │   │   ├── domain/
│   │   │   │   │   ├── model/                    # Review, Comment, Like
│   │   │   │   │   ├── port/in|out/
│   │   │   │   │   └── service/                  # ReviewService, CommentService, LikeService
│   │   │   │   └── infrastructure/
│   │   │   │       ├── web/                      # ReviewController, CommentController
│   │   │   │       ├── persistence/              # ReviewRepository, CommentRepository, LikeRepository
│   │   │   │       └── dto/review|comment|like|mapper/
│   │   │   ├── community/                        # Módulo: book clubs, posts, chat em tempo real
│   │   │   │   ├── domain/
│   │   │   │   │   ├── model/                    # Community, CommunityMember, CommunityPost, CommunityMessage, MessageReaction, CommunityInvite, CommunityJoinRequest
│   │   │   │   │   ├── port/in|out/
│   │   │   │   │   └── service/                  # CommunityService, CommunityMessageService, CommunityPostService
│   │   │   │   └── infrastructure/
│   │   │   │       ├── web/                      # CommunityController, CommunityMessageController, CommunityMessageRestController, CommunityPostController
│   │   │   │       ├── persistence/
│   │   │   │       ├── messaging/
│   │   │   │       ├── external/
│   │   │   │       ├── dto/mapper/
│   │   │   │       └── config/                   # WebSocketConfig (STOMP + RabbitMQ relay)
│   │   │   ├── notification/                     # Módulo: notificações SSE (web) + FCM (mobile)
│   │   │   │   ├── domain/
│   │   │   │   │   ├── model/                    # Notification
│   │   │   │   │   ├── port/in|out/
│   │   │   │   │   └── service/                  # NotificationService, SseService, FcmService
│   │   │   │   └── infrastructure/
│   │   │   │       ├── web/                      # NotificationController (SSE + REST)
│   │   │   │       ├── consumer/                 # Consome eventos do RabbitMQ
│   │   │   │       ├── delivery/                 # SseDeliveryService, FcmDeliveryService, NotificationPublisher
│   │   │   │       ├── persistence/              # NotificationRepository, DeviceTokenRepository
│   │   │   │       ├── dto/
│   │   │   │       └── config/                   # FirebaseConfig, NotificationListenerConfig
│   │   │   └── recommendation/                   # Módulo: recomendações "Because You Read" via Neo4j
│   │   │       ├── domain/
│   │   │       │   ├── model/                    # RecommendationResult, RecommendationEventLog
│   │   │       │   ├── port/in/
│   │   │       │   ├── service/                  # BecauseYouReadService, BecauseYouReadFallbackService, Neo4jGraphService
│   │   │       │   └── exception/
│   │   │       └── infrastructure/
│   │   │           ├── consumer/                 # RecommendationConsumer (RabbitMQ, queue: rec.shelf.completed)
│   │   │           ├── graph/                    # GraphUpdateService
│   │   │           ├── persistence/              # RecommendationResultRepository, EventLogRepository
│   │   │           ├── service/                  # Serviços de suporte à infraestrutura
│   │   │           ├── web/                      # Endpoints de recomendação
│   │   │           ├── dto/
│   │   │           └── config/                   # Neo4jConfig, RecommendationListenerConfig
│   │   └── resources/
│   │       ├── application.properties            # Configuração principal (lê variáveis do .env)
│   │       └── schema.sql                        # DDL executado no startup (spring.sql.init.mode=always)
│   └── test/
│       └── java/com/biblioo/                     # Testes (cobertura mínima — ver Pontos de Atenção)
├── config/
│   ├── prometheus/prometheus.yml                 # Scrape: host.docker.internal:8080/actuator/prometheus (15s)
│   └── rabbitmq/enabled_plugins                  # Plugins habilitados no RabbitMQ
├── performance-tests/                            # Planos JMeter para testes de carga
├── .github/java-upgrade/                         # Hooks de CI/CD para upgrade de Java
├── pom.xml                                       # Maven 4 — dependências e plugins
├── docker-compose.yml                            # Infraestrutura local completa (8 serviços)
├── .env                                          # Secrets e variáveis de ambiente (não versionar em produção)
├── MONITORAMENTO.md                              # Guia Prometheus/Grafana + queries PromQL
├── NOTIFICATIONS.md                              # Integração SSE (Next.js) + FCM (Flutter)
└── T1-BECAUSE_YOU_READ-springboot.md             # Documentação completa do motor de recomendações
```

---

## 3. Convenções de Código

### Idioma
- **Código fonte:** inglês (nomes de classes, métodos, variáveis, pacotes)
- **Comentários/documentação:** português (pt-BR)
- **Logs:** português

### Nomenclatura de classes

| Tipo | Padrão | Exemplos |
|---|---|---|
| Entidade JPA | `NomeSingular` | `Book`, `Shelf`, `ShelfItem`, `Community` |
| Service | `NomeService` | `BookService`, `ShelfService`, `BecauseYouReadService` |
| Repository | `EntidadeRepository` | `BookRepository`, `ShelfItemRepository` |
| Controller REST | `EntidadeController` | `BookController`, `ShelfController` |
| DTO de requisição | `AcaoEntidadeRequest` | `CreateShelfRequest`, `ChangeItemStatusRequest` |
| DTO de resposta | `EntidadeResponse` | `BookResponse`, `ShelfResponse` |
| Mapper (MapStruct) | `EntidadeMapper` | `BookMapper`, `ShelfMapper` |
| Adapter externo | `ServicoAdapter` | `GoogleBooksAdapter`, `FeedInteractionAdapter`, `CloudinaryUploadAdapter` |
| Config Spring | `PropositoConfig` | `SecurityConfig`, `CacheConfig`, `Neo4jConfig` |
| Consumer RabbitMQ | `DominioConsumer` | `RecommendationConsumer` |
| Exception | `DominioException` ou `EntidadeNotFoundException` | `ShelfBusinessException`, `BookNotFoundException` |
| Enum | PascalCase | `ReadingStatus`, `CommunityType`, `InviteStatus` |

### Padrão de pacotes

```
com.biblioo.{modulo}.{camada}.{subtipo}
```

Exemplos:
- `com.biblioo.books.domain.model.Book`
- `com.biblioo.books.domain.port.in.ShelfUseCase`
- `com.biblioo.books.domain.service.ShelfService`
- `com.biblioo.books.infrasestructure.web.ShelfController`  ← typo histórico apenas no módulo books
- `com.biblioo.community.infrastructure.config.WebSocketConfig`

### Estilo
- Formatação via **Spotless + Google Java Format 1.35.0** (estilo `GOOGLE`)
- Lombok (`@RequiredArgsConstructor`, `@Slf4j`, `@Data`, `@Builder`) em todas as classes onde aplicável
- Injeção de dependência **sempre por construtor** (`@RequiredArgsConstructor`)
- `@Transactional(readOnly = true)` em métodos de leitura; `@Transactional` nos de escrita
- Métodos de serviço que alteram cache usam combinações de `@Cacheable`, `@CacheEvict` e `@CachePut`

---

## 4. Stack e Dependências Principais

| Camada | Tecnologia | Versão |
|---|---|---|
| Linguagem | Java | 25 |
| Framework | Spring Boot | 4.0.4 |
| Banco relacional | MySQL | 8.4 |
| Banco de grafo | Neo4j (driver oficial, sem Spring Data Neo4j) | 5.18.0 |
| Busca full-text | OpenSearch | 2.18.0 (client 2.11.1) |
| Cache | Redis (Spring Data Redis) | 7.4 |
| Mensageria | RabbitMQ + Spring AMQP | 4.0 |
| WebSocket | STOMP over RabbitMQ broker relay | — |
| ORM | Hibernate/JPA via Spring Data JPA | — |
| Mapeamento DTOs | MapStruct | 1.5.5.Final |
| Autenticação | JWT (JJWT) | 0.12.6 |
| Push notifications | Firebase Admin SDK (FCM) | 9.4.1 |
| Upload de imagens | Cloudinary HTTP5 | 2.0.0 |
| API externa de livros | Google Books API | — |
| Segurança XSS | JSoup | 1.17.2 |
| Validação de uploads | Apache Tika | 2.9.2 |
| Rate limiting | Bucket4j | 8.10.1 |
| Métricas | Micrometer + Prometheus + Grafana | — |
| Documentação API | Springdoc OpenAPI (Swagger UI) | 2.8.8 |
| Retry | Spring Retry | 2.0.11 |
| Variáveis de ambiente | springboot4-dotenv | 5.1.0 |
| Build | Maven 4 | — |
| Formatação | Spotless + Google Java Format | 2.44.4 / 1.35.0 |
| Threads virtuais | Java Virtual Threads | habilitado (`spring.threads.virtual.enabled=true`) |

---

## 5. Regras Obrigatórias

1. **Nunca versionar o `.env` em produção.** Ele contém JWT secret, senhas de banco, chave Firebase e chave do Google Books.
2. **Não usar Spring Data Neo4j.** O driver Neo4j oficial (`neo4j-java-driver`) é usado diretamente por decisão de design — controle total sobre Cypher. Não adicionar a dependência `spring-boot-starter-data-neo4j`.
3. **`schema.sql` é executado sempre** (`spring.sql.init.mode=always`). DDL de tabelas que precisam existir antes do Hibernate (ex.: `recommendation_event_log`) deve estar aqui. Não remover nem desabilitar.
4. **Idempotência de eventos RabbitMQ é obrigatória.** Todo consumer que persiste estado deve verificar `event_id` na tabela de log antes de processar. Ver `RecommendationConsumer` como referência.
5. **Transactional Outbox para eventos de domínio.** Nunca publicar diretamente no RabbitMQ dentro de um `@Transactional` que também persiste a entidade. Usar o outbox (`OutboxEvent`) para garantir atomicidade.
6. **`open-in-view=false` não deve ser revertido.** A desativação é intencional para evitar N+1 silencioso em requests assíncronos.
7. **O `JwtAuthenticationFilter` não pode ser bypassado.** Qualquer endpoint que precise ser público deve ser configurado explicitamente no `SecurityConfig`, nunca contornando o filtro.
8. **Formatação via Spotless é mandatória antes de commit.** Rodar `mvn spotless:apply` antes de subir código. O estilo é Google Java Format.
9. **`recommendation.t1.*` são parâmetros de negócio configuráveis.** Não hardcodar os valores `candidateLimit=20`, `minCoReaders=2`, `jitterPct=0.03`, `maxSameCategoryRatio=0.60` no código.
10. **Cache nunca deve armazenar valores nulos** (`spring.cache.redis.cache-null-values=false`). Não sobrescrever essa config por `@Cacheable`.

---

## 6. Padrões de Implementação

### Arquitetura Hexagonal (Ports & Adapters)
Cada módulo segue a estrutura:

```
{modulo}/
  domain/
    model/        → entidades JPA e objetos de domínio
    port/in/      → interfaces de casos de uso (entrada)
    port/out/     → interfaces para saídas externas (publisher, repositórios do ponto de vista do domínio)
    service/      → implementações dos use cases (implementam as interfaces port/in)
    exception/    → exceções de negócio
  infrastructure/
    web/          → @RestController — recebe HTTP, delega ao service
    persistence/  → @Repository JPA — implementam port/out
    dto/          → Request/Response e Mappers MapStruct
    config/       → @Configuration específico do módulo
    external/     → adaptadores para APIs externas
    messaging/    → publishers e consumers RabbitMQ
    ...
```

### Padrão de service

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class ShelfService implements ShelfUseCase {

    private final ShelfRepository shelfRepository;
    private final ShelfEventPublisherPort eventPublisher;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(cacheNames = "shelf", key = "#shelfId")
    public ShelfResponse getShelf(Long shelfId) { ... }

    @Override
    @Transactional
    @CacheEvict(cacheNames = {"shelf", "shelf-list"}, key = "#shelfId")
    public void deleteShelf(Long shelfId) { ... }
}
```

### Padrão de controller

```java
@RestController
@RequestMapping("/shelves")
@RequiredArgsConstructor
@Tag(name = "Shelf", description = "Gerenciamento de estantes")
public class ShelfController {

    private final ShelfUseCase shelfUseCase;

    @GetMapping("/{id}")
    @Operation(summary = "Busca estante por ID")
    public ResponseEntity<ShelfResponse> getShelf(@PathVariable Long id) {
        return ResponseEntity.ok(shelfUseCase.getShelf(id));
    }
}
```

### Padrão de consumer RabbitMQ

```java
@Component
@RequiredArgsConstructor
@Slf4j
public class RecommendationConsumer {

    @RabbitListener(queues = "${rabbitmq.queue.rec.shelf.completed}")
    public void handle(Message message, Channel channel) throws Exception {
        // 1. deserializar evento
        // 2. checar idempotência (event_id no log)
        // 3. registrar no log com REQUIRES_NEW
        // 4. processar
        // 5. manual ACK
        // 6. NACK sem requeue em caso de erro → DLQ
    }
}
```

### Padrão de mapper MapStruct

```java
@Mapper(componentModel = "spring")
public interface ShelfMapper {
    ShelfResponse toResponse(Shelf shelf);
    Shelf toDomain(CreateShelfRequest request);
}
```

### Padrão de entidade JPA

```java
@Entity
@Table(name = "shelves", indexes = {
    @Index(name = "idx_shelf_user_id", columnList = "user_id"),
    @Index(name = "idx_shelf_deleted_at", columnList = "deleted_at")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Shelf {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    private LocalDateTime deletedAt; // soft delete
}
```

---

## 7. Integrações Externas

| Serviço | Finalidade | Configuração |
|---|---|---|
| **MySQL 8.4** | Dados relacionais principais | `${MYSQL_PORT}`, `${MYSQL_USER}`, `${MYSQL_PASSWORD}`, `${MYSQL_DATABASE}` |
| **Neo4j 5.18** | Grafo de leitura (user -[READ]→ book) para recomendações T1 | `${NEO4J_URI}` (bolt), `${NEO4J_USER}`, `${NEO4J_PASSWORD}` |
| **Redis 7.4** | Cache de estantes e perfis de usuário (TTL 5min) | `${REDIS_HOST}`, `${REDIS_PORT}`, `${REDIS_PASSWORD}` |
| **OpenSearch 2.18** | Busca full-text de livros e usuários | `${OPENSEARCH_HOST}`, `${OPENSEARCH_PORT}` |
| **RabbitMQ 4.0** | Eventos de domínio assíncronos + relay STOMP para WebSocket | `${RABBITMQ_HOST}`, `${RABBITMQ_PORT}`, `${RABBITMQ_USER}`, `${RABBITMQ_PASSWORD}`, `${RABBITMQ_VHOST}`, `${RABBITMQ_STOMP_PORT}` |
| **Firebase Admin SDK** | Push notifications FCM (mobile) | `${FIREBASE_SERVICE_ACCOUNT_BASE64}` (JSON em Base64) |
| **Cloudinary** | Upload e CDN de imagens (avatar, banner, capas) | `${CLOUDINARY_URL}` |
| **Google Books API** | Enriquecimento automático do catálogo de livros | `${GOOGLE_BOOKS_API_KEY}` |

### Filas RabbitMQ

| Fila | Routing Key | Consumer |
|---|---|---|
| `rec.shelf.completed` | `shelf.reading.completed` | `RecommendationConsumer` |
| `notif.*` | `*.*.{event}` | Consumers do módulo `notification` |

Exchange principal: `biblioo.domain.events` (tipo: Topic)  
DLQ configurada para mensagens que falham após retries.

### Endpoints do Actuator expostos

- `/actuator/health` — saúde da aplicação
- `/actuator/prometheus` — métricas para scrape pelo Prometheus
- `/actuator/metrics` — métricas individuais
- `/actuator/info` — informações da aplicação

---

## 8. Comandos Úteis

### Subir infraestrutura local

```bash
# Todos os serviços (MySQL, Redis, RabbitMQ, OpenSearch, Neo4j, Prometheus, Grafana)
docker-compose up -d

# Com OpenSearch Dashboards (perfil "tools")
docker-compose --profile tools up -d

# Parar tudo
docker-compose down

# Limpar volumes (reset completo)
docker-compose down -v
```

### Build e execução

```bash
# Build completo (compila, formata, empacota)
./mvnw clean package

# Rodar a aplicação (necessita infraestrutura no ar)
./mvnw spring-boot:run

# Apenas compilar sem testes
./mvnw compile -DskipTests

# Rodar testes
./mvnw test
```

### Formatação de código

```bash
# Aplicar formatação Google Java Format (OBRIGATÓRIO antes de commit)
./mvnw spotless:apply

# Verificar formatação sem aplicar
./mvnw spotless:check
```

### Acessos locais

| Serviço | URL | Credenciais |
|---|---|---|
| Aplicação | `http://localhost:8080` | — |
| Swagger UI | `http://localhost:8080/swagger-ui.html` | — |
| Grafana | `http://localhost:3000` | admin/admin |
| Prometheus | `http://localhost:9090` | — |
| RabbitMQ Management | `http://localhost:15672` | biblioo/xV3oB8hJlC9tMn |
| Neo4j Browser | `http://localhost:7474` | neo4j/biblioo_neo4j_2026 |
| OpenSearch Dashboards | `http://localhost:5601` | — (perfil tools) |

---

## 9. O que não fazer

Antipadrões identificados no código atual — não reproduzir em código novo e corrigir ao tocar nesses arquivos.

---

### 9.1 `System.out` / `System.err` / `e.printStackTrace()` em vez de SLF4J

**Encontrado em:**

- [RabbitMQEventPublisher.java:38-57](src/main/java/com/biblioo/infrastructure/messaging/adapter/RabbitMQEventPublisher.java#L38-L57) — falhas de publicação de evento no RabbitMQ logadas em `System.err` + `printStackTrace()`
- [OutboxEventService.java:44-46](src/main/java/com/biblioo/infrastructure/messaging/service/OutboxEventService.java#L44-L46) — falha de serialização do outbox logada em `System.err`
- [BookStatsConsumer.java](src/main/java/com/biblioo/books/infrasestructure/messaging/BookStatsConsumer.java) — eventos de processamento logados com `System.out.println`

**Por que é um problema:** `System.out/err` não passa pelo framework de logging, ignora configuração de nível por ambiente, não captura timestamp nem contexto de MDC, e não aparece em agregadores de log (Grafana Loki, Datadog, etc.).

**Como deve ser:**

```java
// Errado
System.err.println("Falha ao publicar evento " + event.getId());
e.printStackTrace();

// Certo
log.error("Falha ao publicar evento id={} type={}", event.getId(), event.getEventType(), e);
```

---

### 9.2 Deleção assíncrona de imagens fora da transação

**Encontrado em:**

- [ReviewService.java:228-231](src/main/java/com/biblioo/feed/domain/service/ReviewService.java#L228-L231) — `deleteImagesAsync()` dispara `CompletableFuture.runAsync()` dentro de método `@Transactional`
- [CommentService.java](src/main/java/com/biblioo/feed/domain/service/CommentService.java) — mesmo padrão

**Por que é um problema:** Se a transação principal fizer rollback, as imagens já foram deletadas no Cloudinary. Se a task assíncrona falhar, as URLs continuam gravadas no banco apontando para recursos inexistentes. Não há retry, não há tratamento de erro, não há idempotência.

**Como deve ser:** Incluir a URL da imagem a deletar em um outbox event — o processamento assíncrono via RabbitMQ garante retry e não está acoplado ao ciclo da transação.

---

### 9.3 Repository injetado diretamente no Controller

**Encontrado em:**

- [NotificationController.java:39,89-100](src/main/java/com/biblioo/notification/infrastructure/web/NotificationController.java#L39) — `DeviceTokenRepository` injetado e usado diretamente no controller para lógica de negócio (check de existência + save)

**Por que é um problema:** Viola a arquitetura em camadas. O controller assume responsabilidade de service (decidir se deve salvar). Lógica de negócio duplicada fica fora do service, não é testável isoladamente e não é transacional.

**Como deve ser:** Criar método `registerDeviceToken(userId, token)` no `NotificationUseCase` e mover toda a lógica para o service.

---

### 9.4 Injeção de campo (`@Autowired`) em vez de injeção por construtor

**Encontrado em:**

- [SubscriptionAuthorizationInterceptor.java:22](src/main/java/com/biblioo/community/infrastructure/config/SubscriptionAuthorizationInterceptor.java#L22) — `@Autowired private CommunityMemberRepository memberRepository`
- [JwtChannelInterceptor.java](src/main/java/com/biblioo/community/infrastructure/config/JwtChannelInterceptor.java) — mesmo padrão

**Por que é um problema:** Impede que campos sejam `final`, dificulta testes unitários (não é possível injetar mock via construtor), oculta dependências da assinatura da classe e pode mascarar dependências circulares.

**Como deve ser:** Usar `@RequiredArgsConstructor` com campos `private final`, padrão já adotado em todos os outros módulos.

---

### 9.5 Exceção capturada no controller com retorno `null` silencioso

**Encontrado em:**

- [ShelfController.java:62-70](src/main/java/com/biblioo/books/infrasestructure/web/ShelfController.java#L62-L70) e [linha 104-112](src/main/java/com/biblioo/books/infrasestructure/web/ShelfController.java#L104-L112) — `catch (ShelfBusinessException e) { return null; }` dentro de stream, depois filtrado com `Objects::nonNull`

**Por que é um problema:** Erros legítimos (permissão negada, estante não encontrada) são silenciados. O client recebe uma lista incompleta sem saber que algo falhou. Não há log nenhum da exceção capturada.

**Como deve ser:** Deixar a exceção propagar para o `@ControllerAdvice` / handler global de erros, que retorna o status HTTP correto com mensagem de erro.

---

### 9.6 Consumer de notificação sem verificação de idempotência

**Encontrado em:**

- [NotificationConsumer.java:24-122](src/main/java/com/biblioo/notification/infrastructure/consumer/NotificationConsumer.java#L24)

**Por que é um problema:** O `RecommendationConsumer` verifica `eventLogRepository.existsByEventId()` antes de processar. O `NotificationConsumer` não faz isso. Se o RabbitMQ reentregas a mensagem (ACK perdido, restart da aplicação), notificações duplicadas são criadas e entregues ao usuário.

**Como deve ser:** Seguir o padrão do `RecommendationConsumer` — registrar `event_id` em tabela de log com transação `REQUIRES_NEW` antes de processar, e verificar existência antes.

---

### 9.7 Serialização com fallback silencioso no Outbox

**Encontrado em:**

- [OutboxEventService.java:43-47](src/main/java/com/biblioo/infrastructure/messaging/service/OutboxEventService.java#L43-L47) — falha de serialização do payload resulta em `"{}"` salvo no evento, sem relançar a exceção

**Por que é um problema:** O evento é publicado no RabbitMQ com payload vazio. O consumer recebe um JSON sem dados e pode lançar `NullPointerException` ou processar silenciosamente um evento inválido. A falha real (erro de serialização) não interrompe o fluxo.

**Como deve ser:** Relançar a exceção de serialização para abortar a transação. Um evento com payload inválido não deve ser persistido.

---

### 9.8 `catch (Exception e)` em operações críticas de mensageria

**Encontrado em:**

- [RabbitMQEventPublisher.java:49](src/main/java/com/biblioo/infrastructure/messaging/adapter/RabbitMQEventPublisher.java#L49) — captura qualquer `Exception` após falha de publicação e não relança
- [BookService.java](src/main/java/com/biblioo/books/domain/service/BookService.java) — `catch (Exception e)` retorna `List.of()` sem distinguir "sem resultados" de "serviço indisponível"

**Por que é um problema:** Falhas de rede, timeouts e erros de lógica são tratados de forma idêntica. O caller não consegue distinguir uma resposta vazia legítima de uma falha de infraestrutura. No publisher, a falha de publicação não é propagada — o evento fica como `PENDING` para sempre sem mecanismo de retry.

**Como deve ser:** Capturar exceções específicas (`AmqpException`, `IOException`) e relançar as inesperadas. Para o outbox, a falha no `afterCommit()` deve ser registrada e um job de reprocessamento deve pegar eventos `PENDING` antigos.

---

## 10. Pontos de Atenção

1. **Typo no pacote do módulo `books`:** O pacote de infraestrutura usa `infrasestructure` (com 'se') em vez de `infrastructure`. Todos os outros módulos usam `infrastructure` corretamente. Corrigir exige renomear o pacote e atualizar todos os imports — avaliar impacto antes.

2. **Cobertura de testes mínima:** Foi identificado apenas 1 arquivo de teste. Não há testes de integração, testes de repositório ou testes end-to-end visíveis. Risco alto para refactorings.

3. **`spring.jpa.hibernate.ddl-auto=update` em produção:** O modo `update` pode causar comportamento imprevisível em migrações complexas. Em produção, considerar migrar para `validate` + Flyway/Liquibase.

4. **`spring.sql.init.mode=always` + `continue-on-error=true`:** O `schema.sql` é executado a cada startup. Erros são silenciados. Se o DDL tiver instruções que falham silenciosamente, pode gerar inconsistências no schema.

5. **Segurança do OpenSearch desativada no Docker Compose:** `DISABLE_SECURITY_PLUGIN=true` no container do OpenSearch. Adequado apenas para desenvolvimento local — nunca em produção.

6. **Rate limiting desabilitado por padrão:** `rate.limit.enabled=false`. O Bucket4j está configurado mas não ativo. Habilitar antes de ir a produção.

7. **Credenciais expostas no `.env` commitado:** O arquivo `.env` do repositório contém senhas reais (Redis, RabbitMQ, Neo4j, JWT secret, API keys). Em produção, substituir por secrets manager (AWS Secrets Manager, Vault, etc.).

8. **`logging.level.com.biblioo.community=DEBUG`:** Log em DEBUG para o módulo `community` está ativo no `application.properties`. Em produção, aumentar para `INFO` ou `WARN` para evitar vazamento de dados sensíveis em logs.

9. **Neo4j sem Spring Data:** O driver oficial é usado diretamente com Cypher raw. Qualquer mudança no modelo de grafo exige atualizar as queries manualmente em `Neo4jGraphService`. Não há migrações automáticas de grafo.

10. **Versão do Java:** Java 25 é uma versão não-LTS. Spring Boot 4.0.4 tem suporte oficial a Java 21 (LTS) e Java 24. Avaliar estabilidade e suporte a longo prazo.
