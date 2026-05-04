---
name: project-map
description: "Consulte ANTES de procurar qualquer arquivo, classe ou configuração. Use para: onde algo já existe, onde criar algo novo, qual classe faz determinada função, qual módulo contém o quê. Palavras-chave: 'onde fica', 'qual classe faz', 'já existe algo que', 'em qual módulo'. NÃO use para questões de implementação ou padrões de código."
---

## Módulos

| Módulo | Pacote raiz | Responsabilidade |
|---|---|---|
| `books` | `com.biblioo.books` | Catálogo, estantes, coleções; typo histórico: `infrasestructure` |
| `dna` | `com.biblioo.dna` | DNA Literário — perfil de leitura personalizado com 7 dimensões, arquétipos e fases |
| `user` | `com.biblioo.user` | Auth JWT/Google, perfis, follows, busca |
| `feed` | `com.biblioo.feed` | Reviews, posts, comentários, curtidas, fanout |
| `community` | `com.biblioo.community` | Book clubs, chat STOMP, reações, convites |
| `notification` | `com.biblioo.notification` | SSE web + FCM mobile, histórico |
| `recommendation` | `com.biblioo.recommendation` | 6 trilhos de recomendação via Neo4j/Redis/MySQL |
| `infrastructure` | `com.biblioo.infrastructure` | Config global, RabbitMQ, segurança, exceções |

---

## books

**Contratos (port/in):** `BookUseCase` search/getById · `ShelfUseCase` CRUD estantes+itens · `CollectionUseCase` CRUD coleções · `ReadingHistoryUseCase` histórico de leitura por usuário (consumido pelo módulo DNA)

**Entidades:** `Book` → `books` · `Shelf` → `shelves` (soft delete) · `ShelfItem` → `shelf_items` · `Collection` → `shelf_collections` · `Category`

**Controllers:**
- `BookController /books` → GET /search, GET /{id}
- `ShelfController /shelves` → GET, GET /{id}, GET /user/{userId}, POST, PUT /{id}, DELETE /{id}
- `ShelfItemController /shelves/{id}/items` → GET, GET /{itemId}, POST, DELETE /{itemId}, PATCH /{itemId}/progress, PATCH /{itemId}/status
- `CollectionController /collections` → GET, GET /{id}, GET /user/{userId}, POST, PUT /{id}, PATCH /{id}/shelves, DELETE /{id}, GET /{id}/statistics

**Serviços:** `BookService` · `ShelfService` · `CollectionService` · `BookEnrichService` (Google Books assíncrono)

**Messaging:** `BookStatsConsumer` → `BOOK_STATS_QUEUE` (book.stats.#) · `BookStatsDlqConsumer` → DLQ

**Adapters:** `GoogleBooksAdapter` → Google Books API · `OpenSearchBookAdapter` → busca full-text · `FeedInteractionAdapter` → bridge feed

---

## user

**Contratos (port/in):** `AuthUseCase` register/login/refresh/logout/Google · `UserUseCase` perfil/follow/busca · `PasswordResetUseCase` requestPasswordReset/resetPassword/createPassword

**Entidades:** `User` · `UserFollow` (ACCEPTED/PENDING/REJECTED) · `RefreshToken` · `DeviceToken` · `PasswordResetToken` (30 min expiry, max 3/hora)

**Controllers:**
- `AuthController /auth` → POST /register, /login, /refresh, /logout, /google
- `PasswordResetController /auth` → POST /forgot-password, /reset-password, /create-password (autenticado)
- `UserController /users` → GET /me, GET /{username}, PUT /me, PUT /me/visibility, POST /me/avatar, POST /me/banner, POST /{username}/follow, DELETE /{username}/follow, GET /me/follow-requests, POST+DELETE /me/follow-requests/{username}, DELETE /me, GET ?q=, GET /{username}/followers, GET /{username}/following

**Serviços:** `AuthServiceImpl` · `PasswordResetService` · `UserService` · `CachedUserService` (decorator Redis) · `JwtService`

**Security:** `JwtAuthenticationFilter` · `UserDetailsServiceAdapter` · `GoogleTokenVerifierAdapter`

**Adapters:** `OpenSearchUserAdapter` → busca usuários · `CloudinaryUploadAdapter` → avatar/banner · `RabbitMQPasswordResetEmailAdapter` → publica eventos de e-mail via Outbox

---

## feed

**Contratos (port/in):** `ReviewUseCase` · `FeedPostUseCase` · `CommentUseCase` · `FeedUseCase` · `UserReviewsUseCase` avaliações por usuário (consumido pelo módulo DNA)

**Entidades:** `Review` → herda `Content` (soft delete; sem tags/spoiler/imagens/gif) · `FeedPost` → herda `Content` com `bookId` opcional · `Comment` · `Like` · `FeedItem` (read-side fanout) · `FeedFanoutProgress`

**Controllers:**
- `FeedController /feed` → GET / (cursor+size)
- `ReviewController /feed/reviews` → POST (bookId, rating, text?), PUT /{id} (rating?, text?), DELETE /{id}, GET /{id}, POST /{id}/like
- `CommentController /feed/reviews/{id}/comments` → POST, PUT /{commentId}, DELETE /{commentId}, GET, POST /{commentId}/like
- `FeedPostController /feed/posts` → POST (text, bookId?, images?, gif?, tags?, hasSpoiler), PUT /{id}, DELETE /{id}, GET /{id}, POST /{id}/like, GET ?userId=

**Messaging:** `FeedFanoutConsumer` → `FEED_FANOUT_QUEUE` · `FeedFollowBackfillConsumer` → `FEED_BACKFILL_QUEUE`

**Publishers:** `RabbitMQFeedPostFanoutAdapter` · `RabbitMQReviewFanoutAdapter`

**Cache:** `FeedCacheService` → Redis feed por usuário

---

## community

**Contratos (port/in):** `CommunityUseCase` CRUD+membros+roles · `CommunityMessageUseCase` send/edit/delete/react

**Entidades:** `Community` · `CommunityMember` (OWNER/ADMIN/MODERATOR/MEMBER) · `CommunityMessage` (threads) · `CommunityInvite` · `CommunityJoinRequest` · `MessageReaction`

**Controllers:**
- `CommunityController /communities` → POST, GET /{id}, PUT /{id}, DELETE /{id}, GET ?q=, GET /mine, GET /{id}/members, GET /{id}/book, POST /{id}/join, DELETE /{id}/leave, POST /{id}/members/{userId}/role, DELETE /{id}/members/{userId}, POST /{id}/transfer-ownership
- `CommunityMessageController` (STOMP) → /community/{id}/send, /edit, /delete, /react, /typing
- `CommunityMessageRestController /communities/{id}/messages` → GET / (cursor), GET /sync (after), POST /media

**Config:** `WebSocketConfig` · `JwtChannelInterceptor` · `SubscriptionAuthorizationInterceptor`

**Messaging:** `CommunityBroadcastConsumer` → `COMMUNITY_BROADCAST_EXCHANGE` (Fanout) · `RabbitMQCommunityEventAdapter` (publisher)

---

## notification

**Contratos (port/in):** `NotificationUseCase` histórico/unread/markRead · `NotificationDeliveryPort` (SSE + FCM)

**Entidades:** `Notification` → `notifications` · `DeviceToken`

**Controller:** `NotificationController /notifications` → GET /stream (SSE), GET, GET /unread-count, PUT /{id}/read, PUT /read-all, POST /device-token, DELETE /device-token

**Serviço:** `NotificationService`

**Adapters:** `FcmNotificationAdapter` → Firebase FCM · `SseNotificationAdapter` → SSE

**Messaging:** `NotificationConsumer` → `NOTIFICATION_QUEUE` (notification.#) · `NotificationDlqConsumer` → DLQ

**Config:** `FirebaseConfig` · `NotificationListenerConfig`

---

## dna

**Contratos (port/in):** `LiteraryDnaUseCase` getDna/triggerRecalculation/getSnapshots/getPhases/renamePhase

**Entidades:** `LiteraryDna` → `literary_dna` (único por userId) · `DnaSnapshot` → `dna_snapshots` (snapshot mensal) · `LiteraryPhase` → `literary_phases` · `DnaEventLog` → `dna_event_log` (idempotência)

**Enums:** `LiteraryArchetype` (8 arquétipos) · `DnaStatus` (IN_FORMATION / COMPUTING / COMPUTED)

**Controller:** `DnaController /dna` → GET / (DNA ou progresso), GET /snapshots, GET /phases, PATCH /phases/{id}/name

**Serviços:** `LiteraryDnaService` (orchestração) · `DnaCalculationService` (cálculo das 7 dimensões) · `DnaSnapshotService` (snapshot mensal + detecção de fases)

**Messaging:** `DnaRecalculationConsumer` → `DNA_RECALC_QUEUE` (bindings: shelf.reading.completed, shelf.reading.abandoned, feed.review.rating.updated) · `DnaRecalculationDlqConsumer` → DLQ

**Config:** `DnaScheduler` → cron na virada do mês (criar snapshots mensais para todos os usuários)

**Dados que consome de outros módulos:** `ReadingHistoryUseCase` (books) · `UserReviewsUseCase` (feed)

---

## recommendation

**Contratos (port/in):** `RecommendationUseCase` 6 métodos (um por trilho)

**Trilhos:** T1 `BecauseYouReadService` · T2 `FavoriteGenreNowService` · T3 `TrendingInCommunitiesService` · T4 `CatalogSurpriseService` · T5 `SimilarAuthorsService` · T6 `RereadWorthItService`

**Controller:** `RecommendationController /recommendations` → GET /because-you-read, /favorite-genre-now, /trending-in-communities, /catalog-surprise, /similar-authors, /reread-worth-it

**Graph:** `Neo4jGraphService` → Cypher raw sobre Neo4j (sem Spring Data Neo4j)

**Idempotência:** `RecommendationEventLog` + `EventLogRepository` — prefixo por trilho: BYR:/FGN:/CS:/SA:/RWI:

**Consumers:** `BecauseYouReadConsumer` (BYR_QUEUE) · `FavoriteGenreNowConsumer` (FGN_QUEUE) · `CatalogSurpriseConsumer` (CATALOG_SURPRISE_QUEUE) · `SimilarAuthorsConsumer` (SA_QUEUE) · `RereadWorthItConsumer` (RWI_QUEUE) · `TrendingInCommunitiesConsumer` (TIC_MESSAGE_QUEUE + TIC_JOIN_QUEUE)

---

## infrastructure (transversal)

**Segurança:** `SecurityConfig` → JWT stateless, CORS, BCrypt · `GlobalExceptionHandler` → 40+ mapeamentos exceção→HTTP

**RabbitMQ:** `RabbitMQConfig` → exchange `biblioo.events` (topic) + DLX `biblioo.events.dlx`; define todas as filas acima

**Publishers:** `RabbitMQEventPublisher` · `RabbitMQShelfEventAdapter` · `RabbitMQUserNotificationAdapter` · `RabbitMQFeedEventAdapter` · `RabbitMQPasswordResetEmailAdapter` → fila `biblioo.email` (email.#)

**Email Consumer:** `EmailConsumer` → `EMAIL_QUEUE` (email.#) · chama SendGrid REST API via `RestClient`

**Outbox:** `OutboxEvent` (@Entity) + `OutboxEventService` → publicação transacional confiável

**Config:** `CacheConfig` → Redis+Retry · `OpenSearchConfig` → cliente OS · `CloudinaryConfig` → SDK · `OpenApiConfig` → Swagger JWT · `WebConfig` → CORS global · `RateLimitingFilter` → Bucket4j

---

## Onde Criar Coisas Novas

| Artefato | Caminho canônico |
|---|---|
| Entidade JPA | `{modulo}/domain/model/` |
| Interface UseCase | `{modulo}/domain/port/in/` |
| Implementação Service | `{modulo}/domain/service/` |
| Exceção de negócio | `{modulo}/domain/exception/` |
| Controller REST | `{modulo}/infrastructure/web/` |
| Repository JPA | `{modulo}/infrastructure/persistence/` |
| DTO Request/Response | `{modulo}/infrastructure/dto/` |
| Mapper MapStruct | `{modulo}/infrastructure/dto/mapper/` |
| Consumer RabbitMQ | `{modulo}/infrastructure/consumer/` ou `messaging/` |
| Adapter externo | `{modulo}/infrastructure/external/` |
| Config do módulo | `{modulo}/infrastructure/config/` |
| Config transversal | `com.biblioo.infrastructure/config/` |
| Fila/binding RabbitMQ | `RabbitMQConfig.java` (infrastructure) |
| Teste K6 | `performance-tests/{DomainName}/{resource}/{resource}-{load\|spike\|stress}.js` |

---

> **Atualização:** sempre que uma nova classe, módulo ou configuração for adicionada ao projeto, atualizar a seção correspondente desta skill antes de fechar a tarefa.
