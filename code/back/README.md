<img width="1600" style="height:auto; border-radius: 12px;" alt="banner" src="../../docs/imagens/banner.png" />

# Backend

> API REST do Biblioo — rede social de leitura com estantes, reviews, feed personalizado, comunidades com chat em tempo real, seis algoritmos de recomendação, notificações push e assistente de IA conversacional.

---

## Stack Principal

![Java](https://img.shields.io/badge/Java-25-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.0.4-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.4-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Neo4j](https://img.shields.io/badge/Neo4j-5.18-008CC1?style=for-the-badge&logo=neo4j&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7.4-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![OpenSearch](https://img.shields.io/badge/OpenSearch-2.18-005EB8?style=for-the-badge&logo=opensearch&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-4.0-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Cloud Run](https://img.shields.io/badge/Cloud_Run-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white)
![Cloud Build](https://img.shields.io/badge/Cloud_Build-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)
![TiDB Cloud](https://img.shields.io/badge/TiDB_Cloud-E1012B?style=for-the-badge&logo=tidb&logoColor=white)
![Upstash](https://img.shields.io/badge/Upstash-00E9A3?style=for-the-badge&logo=upstash&logoColor=white)
![CloudAMQP](https://img.shields.io/badge/CloudAMQP-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)
![Bonsai.io](https://img.shields.io/badge/Bonsai.io-005EB8?style=for-the-badge&logo=opensearch&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)
![Neo4j Aura](https://img.shields.io/badge/Neo4j_Aura-008CC1?style=for-the-badge&logo=neo4j&logoColor=white)
![GCE](https://img.shields.io/badge/Compute_Engine-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white)
![Secret Manager](https://img.shields.io/badge/Secret_Manager-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white)

---

## Sumário

- [Sobre o projeto](#sobre-o-projeto)
- [Arquitetura](#arquitetura)
- [Estrutura de módulos](#estrutura-de-módulos)
- [Algoritmos de recomendação](#algoritmos-de-recomendação)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Infraestrutura Docker](#infraestrutura-docker)
- [Seed data](#seed-data)
- [Comprovações de mensageria](#comprovações-de-mensageria)
- [Testes de performance](#testes-de-performance)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Instalação e execução](#instalação-e-execução)
- [Deploy em nuvem](#deploy-em-nuvem)
- [Observabilidade](#observabilidade)
- [Padrão de código](#padrão-de-código)
- [Regras de arquitetura](#regras-de-arquitetura)
- [Tecnologias e dependências](#tecnologias-e-dependências)
- [APIs e endpoints](#apis-e-endpoints)

---

## Sobre o projeto

O **Biblioo** é uma rede social focada em leitores. Cada usuário organiza livros em estantes personalizadas, registra o progresso página a página, escreve reviews com nota, publica posts com imagens e GIFs, e interage com outros leitores por comentários, curtidas e seguidores.

As comunidades têm chat em tempo real via WebSocket/STOMP — com mensagens entregues entre múltiplas instâncias Cloud Run via RabbitMQ FanoutExchange — e um sistema de votação de livros com ciclo de estados completo (draft → publicado → votação → encerrado → aprovado/rejeitado).

As recomendações são o diferencial central da plataforma: seis algoritmos independentes cobrem ângulos distintos de descoberta — grafo de co-leitura (Neo4j), gêneros dominantes do momento, engajamento em comunidades com decay temporal, exploração bayesiana (Thompson Sampling), filtragem colaborativa e repetição espaçada para releituras. Cada trilha é recomputada de forma assíncrona via RabbitMQ quando eventos de domínio relevantes ocorrem, e os resultados são armazenados no Redis por usuário.

O assistente **Bibo**, integrado ao Google Gemini via Spring AI, vai além de responder perguntas: ele executa ações dentro da plataforma — cria comunidades, organiza estantes, monta coleções — tudo por linguagem natural, com histórico de conversa persistido no Redis e rate limit de 20 requisições por minuto.

Notificações chegam via SSE para usuários com o app web aberto e via Firebase FCM para dispositivos mobile em background. O DNA Literário calcula um perfil de leitura com arquétipos, temas e velocidade de leitura a partir do histórico de cada usuário.

---

## Arquitetura

A aplicação segue o estilo **Hexagonal (Ports & Adapters)** em um **monólito modular**. Cada módulo expõe ports de entrada (use cases) e de saída (repositórios, eventos, cache) — sem dependências diretas entre módulos fora dessas interfaces. Isso garante que qualquer módulo possa ser extraído para um serviço independente sem reescrever lógica de domínio.

![Arquitetura de domínio](../../docs/imagens/architecture-domain.png)

**Padrões centrais:**

| Padrão | Onde se aplica |
|---|---|
| Outbox | Publicação assíncrona no RabbitMQ dentro de `@Transactional` — garante que mensagens só saem após commit |
| Fanout-on-write | Feed com threshold de 10.000 seguidores — acima disso, entrega diferida on-read |
| Thompson Sampling | Trilha T4 — CatalogSurprise — aprendizado bayesiano por interação |
| Spaced Repetition | Trilha T6 — RereadWorthIt — intervalo cresce com o número de releituras |
| Exponential Decay | Trilha T3 — TrendingInCommunities — score decai 10% por hora automaticamente |
| Collaborative Filtering | Trilha T5 — SimilarAuthors — 2 saltos no grafo Neo4j |
| Sliding Window Cache | Feed Redis com warm-size de 200 itens por usuário |
| Idempotência por `event_id` | Todos os consumers RabbitMQ verificam duplicatas antes de processar |

### Estratégia de Feed — Fanout, Threshold e Backfill

O feed é a funcionalidade mais lida da plataforma: cada usuário abre várias vezes por sessão, mas publica esporadicamente. Essa assimetria entre leituras e escritas orienta todo o design do módulo `feed`.

#### Fanout-on-write com threshold de 10.000 seguidores

Ao publicar um post, o evento `feed.fanout.publish` é salvo via Outbox e consumido pelo `FeedFanoutConsumer`. O consumer escreve uma entrada no feed Redis de cada seguidor individualmente — garantindo que `GET /feed` seja uma leitura direta do cache, sem joins ou consultas ao banco relacional.

O problema surge em perfis de grande audiência: um post de alguém com 50.000 seguidores geraria 50.000 escritas simultâneas no Redis, criando picos de pressão que degradam a performance global. Para evitar esse efeito — conhecido como "celebrity problem" — o sistema aplica um threshold de 10.000 seguidores:

| Perfil do autor | Estratégia | Mecanismo |
|---|---|---|
| < 10.000 seguidores | Fanout-on-write | `FeedFanoutConsumer` distribui o post no Redis de cada seguidor ao publicar |
| ≥ 10.000 seguidores | Fanout diferido | Post não é distribuído imediatamente; seguidores recebem ao consultar o feed |

#### Sliding Window Cache

O feed de cada usuário no Redis é mantido como uma sliding window de 200 itens. A paginação por cursor (`GET /feed?cursor=...`) consome esses itens diretamente do cache. À medida que o usuário avança e a janela se esgota, o sistema reabastece com itens mais antigos vindos do banco — mantendo latência baixa mesmo para feeds densos. Resultado: `feed-stress` registrou p95 de **303ms sob 600 VUs** sem nenhuma consulta ao banco relacional para leitura de feed.

#### Backfill ao ganhar novo seguidor

Quando o usuário B começa a seguir o usuário A, o evento `notification.user.followed` aciona o `FeedFollowBackfillConsumer`. Esse consumer retroativamente insere os posts recentes de A no feed de B — evitando que o feed apareça vazio logo após um novo follow.

```mermaid
flowchart LR
    POST["Usuário publica post"]
    OUTBOX["OutboxEventService\nfeed.fanout.publish"]
    RMQ["biblioo.feed.fanout\n(RabbitMQ)"]
    CHECK{"≥ 10.000 seguidores?"}
    FANOUT["FeedFanoutConsumer\nescreve no Redis\nde cada seguidor"]
    DEFER["Fanout diferido\n(entrega on-read)"]
    FOLLOW["Usuário B segue A"]
    BACKFILL["FeedFollowBackfillConsumer\nbiblioo.feed.follow.backfill\ninsere posts recentes de A\nno feed de B"]

    POST --> OUTBOX --> RMQ --> CHECK
    CHECK -->|Não| FANOUT
    CHECK -->|Sim| DEFER
    FOLLOW --> BACKFILL
```

---

## Estrutura de módulos

| Módulo | Responsabilidade |
|---|---|
| `assistant` | Assistente Bibo integrado ao Google Gemini via Spring AI. Processa linguagem natural, mantém histórico de conversa por sessão no Redis (TTL 24h), executa ações na plataforma (criar comunidade, organizar estante, montar coleção) e responde perguntas sobre livros. Rate limit de 20 req/min por usuário via Bucket4j. |
| `books` | Catálogo de livros com busca híbrida (OpenSearch para full-text, Google Books API para enriquecimento). Estantes com rastreamento de progresso página a página e streak de leitura (dias distintos com progresso registrado). Coleções com estatísticas agregadas (total de livros, páginas, distribuição por status). Importação de biblioteca Goodreads via CSV. |
| `community` | Comunidades públicas e privadas com sistema de roles (OWNER, MODERATOR, MEMBER). Chat em tempo real via WebSocket/STOMP com entrega cross-instância via RabbitMQ FanoutExchange. Votação de livros com máquina de estados (DRAFT → PUBLISHED → CLOSED → APPROVED/REJECTED). Convites por link de token e convites diretos. Solicitações de entrada para comunidades privadas com aprovação/rejeição pelo moderador. |
| `dna` | DNA Literário: calcula um perfil de leitura anual com arquétipo dominante (Explorador, Clássico, Visionário...), velocidade média de leitura em dias por livro, taxa de releitura, taxa de abandono, distribuição de gêneros e temas literários. Requer mínimo de 5 livros lidos para ativação. Recalcutado assincronamente via RabbitMQ quando livros são concluídos ou abandonados. |
| `feed` | Feed personalizado com cursor-based pagination. Posts com texto, até 5 imagens e 1 GIF via Cloudinary, tags e flag de spoiler. Reviews com nota 1–5 estrelas. Comentários em posts e reviews. Curtidas em posts, reviews e comentários. Fanout assíncrono via RabbitMQ com threshold de 10.000 seguidores. |
| `infrastructure` | Configuração global, padrão Outbox, rate limiting com Bucket4j, integração Cloudinary, limpeza semanal do índice OpenSearch, seed de dados de desenvolvimento. |
| `notification` | Notificações geradas por eventos de domínio (follow, convite, aprovação de entrada). Entregues via SSE para clientes web conectados e via Firebase FCM para dispositivos mobile em background. Histórico paginado, badge de não lidas, gestão de device tokens FCM. |
| `recommendation` | Seis algoritmos de recomendação independentes (ver seção abaixo). Cada trilha é recomputada por eventos de domínio via RabbitMQ e armazenada no Redis por usuário. Roll Dice agrega e embaralha as seis trilhas. |
| `share` | Geração de cards de compartilhamento social como imagem (retornados em bytes). Importação de biblioteca do Goodreads via CSV (máx. 10 MB / 10.000 linhas). |
| `trending` | Top 10 livros e comunidades com maior atividade nas últimas 48 horas (janela configurável). Score calculado com decay temporal por interação. Cache Redis renovado a cada 15 minutos pelo `TrendingScheduler`. Retorna título, autores e métricas de interação recente (avaliações, adições à estante, progresso, curtidas). |
| `user` | Autenticação com e-mail/senha e Google OAuth. Perfil público e privado com avatar e banner via Cloudinary. Sistema de seguidores com suporte a contas privadas (solicitação de follow com aprovação manual). Busca por username via OpenSearch. Redefinição de senha por e-mail (SendGrid + SMTP Gmail). |

---

## Algoritmos de recomendação

O sistema de recomendação é o diferencial central do Biblioo. São seis trilhas independentes, cada uma com uma estratégia distinta para cobrir ângulos diferentes de descoberta. Nenhuma usa IA generativa: os resultados vêm de algoritmos determinísticos e estatísticos, acionados por eventos de domínio via RabbitMQ e cacheados no Redis por usuário.

### T1 — BecauseYouRead

> "Quem leu o mesmo livro que você também leu estes..."

Conecta leitores pelo título em comum. Quando o usuário conclui um livro, o sistema navega o grafo Neo4j para encontrar outros usuários que leram o mesmo título e retorna os livros que eles também leram — mas que o usuário ainda não conhece. Quanto mais leitores em comum, mais forte o sinal.

- Grava `(:User)-[:READ]->(:Book)` no Neo4j a cada conclusão
- Filtra por `min-co-readers: 2` para garantir sinal mínimo
- Aplica jitter ±3% para diversificar listas entre usuários com perfis parecidos
- Cap de 60% por categoria para evitar monotonia de gênero
- Fallback automático para SQL se o Neo4j estiver indisponível

### T2 — FavoriteGenreNow

> "Você está numa fase de ficção científica — aqui estão os melhores títulos que ainda não leu."

Detecta os 3 gêneros dominantes do momento atual do usuário (não o histórico de todos os tempos, mas o que ele está lendo e avaliando agora) e busca os melhores livros nesses gêneros que ele ainda não conhece.

- Estágio 1 prioriza livros com avaliações suficientes (`min-reviews: 10`) e nota alta
- Se não preencher os 20 slots, estágio 2 completa por popularidade (`reader_count`)
- Resultado persistido com os nomes dos gêneros para exibição contextual no app

### T3 — TrendingInCommunities

> "Este livro está em alta nas comunidades agora — as pessoas estão comentando muito sobre ele."

Capta o que está gerando engajamento real nas comunidades em tempo real. Cada mensagem publicada ou nova entrada em comunidade vinculada a um livro incrementa o score desse livro. O score decai naturalmente com o tempo, garantindo que só o que é relevante agora aparece.

- Pesos por evento: mensagem `2.0` · entrada na comunidade `0.5`
- Deduplicação por janela de 24h por `(userId, bookId)` para evitar spam de score
- Decay de 10% por hora — livros parados desaparecem naturalmente
- Fallback dos últimos 60 dias quando o score orgânico é insuficiente

### T4 — CatalogSurprise

> "Saia da zona de conforto — aqui está algo diferente do que você costuma ler, mas que faz sentido para o seu perfil."

A trilha que combate o efeito de bolha. Propõe livros de categorias distantes do perfil habitual usando Thompson Sampling — algoritmo bayesiano que aprende com cada interação. Livros concluídos reforçam positivamente; livros abandonados reforçam negativamente. Livros sem histórico têm prior uniforme e sempre têm chance real de aparecer.

- Parâmetros α/β por `(userId, bookId)` persistidos no Redis (TTL 90 dias)
- Concluído → `α++` · Abandonado → `β++`
- Score = `θ ~ Beta(α, β) × score_base`
- TTL curto preserva a natureza estocástica entre sessões

### T5 — SimilarAuthors

> "Leitores com gosto parecido com o seu adoraram estes livros — de autores que você ainda não explorou."

Combina duas fontes: o próprio histórico do usuário e o comportamento de leitores similares via grafo Neo4j. Mistura descoberta pessoal com descoberta social.

- **L1** — livros de autores já bem avaliados pelo próprio usuário (`min-rating: 4`, concluídos há ≥ 7 dias)
- **L2** — Neo4j 2 saltos até 30 usuários similares → livros que avaliaram bem
- L2 com score alto pode superar L1 (zona de sobreposição `[0.6–0.7]` intencional para diversificar)

### T6 — RereadWorthIt

> "Faz um tempo que você leu este livro — pode ser o momento certo para revisitá-lo."

A única trilha focada em releitura. Usa repetição espaçada para calcular, livro a livro, o momento ideal para reler com base na nota e no número de releituras anteriores. Quanto maior a nota e mais releituras, maior o intervalo antes de sugerir novamente.

- `intervalo = avaliação × 30 dias × 1.5^n_releituras`
- Exemplo: nota 5, 1ª vez → 150 dias de intervalo
- Mínimo de 90 dias desde a última leitura para aparecer na trilha
- `score = 0.7 × maturity + 0.3 × (avaliação / 5.0)`
- `reread_count` rastreado em JSON de metadados (constraint única em `shelf_items` impede duplicatas por status)

---

## Estrutura de pastas

```
back/
├── config/
│   ├── grafana.json                  # Dashboard Grafana pré-configurado (importar direto)
│   ├── prometheus/
│   │   └── prometheus.yml            # Scrape config do /actuator/prometheus
│   └── rabbitmq/
│       └── enabled_plugins           # Habilita stomp, management, prometheus
├── performance-tests/
│   ├── docs/
│   │   ├── RELATORIO-GERAL.md        # Resultados consolidados dos 71 testes
│   │   └── DOCUMENTO-AVALIACAO-PERFORMANCE.md
│   ├── evidencias/                   # Prints de load, spike e stress
│   ├── DomainBook/
│   ├── DomainCommunity/
│   ├── DomainDna/
│   ├── DomainFeed/
│   ├── DomainRecommendation/
│   ├── DomainShare/
│   ├── DomainTrending/
│   └── DomainUser/
├── src/
│   └── main/
│       ├── java/com/biblioo/
│       │   ├── BibliooApplication.java
│       │   ├── assistant/
│       │   ├── books/
│       │   ├── community/
│       │   ├── dna/
│       │   ├── feed/
│       │   ├── infrastructure/
│       │   │   ├── config/
│       │   │   │   └── seed/         # Seed de dados de desenvolvimento
│       │   │   └── messaging/        # Outbox, RabbitMQ config, publishers
│       │   ├── notification/
│       │   ├── recommendation/
│       │   ├── share/
│       │   ├── trending/
│       │   └── user/
│       └── resources/
│           ├── application.properties
│           └── schema.sql            # DDL complementar (roda a cada startup)
├── docker-compose.yml
├── pom.xml
└── .env
```

### Estrutura padrão de um módulo

```
{modulo}/
├── domain/
│   ├── model/         # Entidades e value objects — Dart/Java puros, sem dependência de framework
│   ├── port/
│   │   ├── in/        # Use cases (interfaces que o controller chama)
│   │   └── out/       # Ports de saída (repositório, cache, mensageria)
│   └── service/       # Implementações dos use cases
└── infrastructure/
    ├── web/           # Controllers REST + DTOs de request/response
    ├── persistence/   # Repositórios JPA/JDBC que implementam os ports de saída
    ├── messaging/     # Consumers e publishers RabbitMQ
    ├── cache/         # Adaptadores Redis
    └── config/        # Beans de configuração específicos do módulo
```

---

## Infraestrutura Docker

O `docker-compose.yml` sobe todos os serviços de infraestrutura localmente. A aplicação Spring Boot roda fora do Compose via `./mvnw spring-boot:run`. Em produção, cada serviço é substituído por um provedor gerenciado.

| Serviço | Imagem | Porta | Função |
|---|---|---|---|
| `biblioo-mysql` | `mysql:8.4` | `3307` | Banco relacional principal |
| `biblioo-redis` | `redis:7.4-alpine` | `6379` | Cache, feed, parâmetros bandit |
| `biblioo-rabbitmq` | `rabbitmq:4.0-management-alpine` | `5672` / `15672` / `61613` | Mensageria + STOMP relay |
| `biblioo-opensearch` | `opensearchproject/opensearch:2.18.0` | `9200` | Busca full-text |
| `biblioo-neo4j` | `neo4j:5.18` | `7474` / `7687` | Grafo de recomendações |
| `biblioo-prometheus` | `prom/prometheus:v2.53.0` | `9090` | Coleta de métricas |
| `biblioo-grafana` | `grafana/grafana:10.4.5` | `3001` | Dashboards |
| `biblioo-opensearch-dashboards` | `opensearchproject/opensearch-dashboards:2.18.0` | `5601` | UI OpenSearch (perfil `tools`) |

> MySQL, Redis, RabbitMQ e OpenSearch têm healthcheck configurado. O `opensearch-dashboards` só sobe com `--profile tools`.

```bash
# Subir infraestrutura
docker-compose up -d

# Subir com OpenSearch Dashboards
docker-compose --profile tools up -d

# Acompanhar saúde dos serviços
docker-compose ps
```

---

## Seed data

Com `BIBLIOO_SEED_ENABLED=true` no `.env`, a aplicação popula o banco com dados de desenvolvimento realistas na primeira inicialização. O `SeedOrchestrator` coordena a execução dos seeds na ordem correta.

| Serviço de seed | O que cria |
|---|---|
| `UserSeedService` | Usuários com e-mail, senha (`password123`), avatar e perfis variados de leitura |
| `BookSeedService` | Catálogo de livros com autores, ISBN, capa e categorias |
| `LibrarySeedService` | Estantes e itens por usuário — 5 perfis de leitor distintos, 7 estantes por perfil, 8 livros por estante com status variados |
| `FeedSeedService` | Posts e reviews distribuídos no tempo com curtidas e comentários |
| `CommunitySeedService` | Comunidades públicas e privadas com membros, mensagens de chat e votações |
| `FollowSeedService` | Rede de seguidores entre usuários |

O seed respeita idempotência: verifica se os dados já existem antes de inserir. Para resetar, truncar as tabelas e reiniciar a aplicação com a flag ativa.

Credencial padrão de todos os usuários seed: `password123`

---

## Comprovações de mensageria

> **Sobre o Firebase:** o Firebase FCM é usado **exclusivamente** para entregar notificações push ao dispositivo mobile quando o app está em background ou fechado — é um canal de entrega de notificação, não um message broker. Todo o backbone de mensageria assíncrona (chat, recomendações, feed fanout, notificações in-app, e-mail, DNA) roda sobre **RabbitMQ via Spring AMQP**.

### Exchanges e topologia

A configuração completa está em [`src/main/java/com/biblioo/infrastructure/messaging/config/RabbitMQConfig.java`](src/main/java/com/biblioo/infrastructure/messaging/config/RabbitMQConfig.java).

```mermaid
flowchart TD
    APP["Aplicação Spring Boot"]
    ME["biblioo.events\nTopicExchange · durable"]
    DLX["biblioo.events.dlx\nDirectExchange · DLX global"]
    FE["biblioo.community.broadcast\nFanoutExchange · chat cross-instância"]

    APP -->|"routingKey dinâmica"| ME
    APP -->|"FanoutExchange"| FE

    ME -->|"book.stats.#"| Q1["biblioo.book.stats"]
    ME -->|"notification.#"| Q2["biblioo.notification"]
    ME -->|"shelf.reading.completed"| Q3["rec.shelf.completed (BYR)"]
    ME -->|"shelf.reading.completed"| Q4["rec.favorite-genre-now.triggered (FGN)"]
    ME -->|"shelf.reading.completed / abandoned"| Q5["trail.catalog-surprise.recompute.queue (CS)"]
    ME -->|"shelf.reading.completed"| Q6["rec.similar-authors.triggered (SA)"]
    ME -->|"shelf.reading.completed"| Q7["rec.reread-worth-it.triggered (RWI)"]
    ME -->|"community.trending.message"| Q8["rec.trending-in-communities.message (TIC)"]
    ME -->|"community.trending.join"| Q9["rec.trending-in-communities.join (TIC)"]
    ME -->|"feed.fanout.#"| Q10["biblioo.feed.fanout"]
    ME -->|"notification.user.followed"| Q11["biblioo.feed.follow.backfill"]
    ME -->|"email.#"| Q12["biblioo.email"]
    ME -->|"feed.review.rating.updated / shelf.*"| Q13["biblioo.dna.recalculation"]

    Q1 -->|"x-dead-letter"| DLX
    Q2 -->|"x-dead-letter"| DLX
    Q3 -->|"x-dead-letter"| DLX
    Q10 -->|"x-dead-letter"| DLX

    FE -->|"fila anônima por instância"| CB["CommunityBroadcastConsumer"]
```

### Queues declaradas

| Queue | Routing key | Consumer | Domínio |
|---|---|---|---|
| `biblioo.book.stats` | `book.stats.#` | `BookStatsConsumer` | Atualiza `reader_count`, `review_count`, `avg_rating` |
| `biblioo.notification` | `notification.#` | `NotificationConsumer` | Notificações in-app (follow, convite, aprovação) |
| `rec.shelf.completed` | `shelf.reading.completed` | `BecauseYouReadConsumer` | T1 — co-leitura Neo4j |
| `rec.favorite-genre-now.triggered` | `shelf.reading.completed` | `FavoriteGenreNowConsumer` | T2 — gêneros dominantes |
| `trail.catalog-surprise.recompute.queue` | `shelf.reading.completed/abandoned` | `CatalogSurpriseConsumer` | T4 — Thompson Sampling (α/β no Redis) |
| `rec.similar-authors.triggered` | `shelf.reading.completed` | `SimilarAuthorsConsumer` | T5 — filtragem colaborativa Neo4j |
| `rec.reread-worth-it.triggered` | `shelf.reading.completed` | `RereadWorthItConsumer` | T6 — repetição espaçada |
| `rec.trending-in-communities.message` | `community.trending.message` | `TrendingInCommunitiesConsumer` | T3 — score por mensagem (peso 2.0) |
| `rec.trending-in-communities.join` | `community.trending.join` | `TrendingInCommunitiesConsumer` | T3 — score por entrada (peso 0.5) |
| `biblioo.feed.fanout` | `feed.fanout.#` | `FeedFanoutConsumer` | Fanout de posts/reviews para feeds dos seguidores |
| `biblioo.feed.follow.backfill` | `notification.user.followed` | `FeedFollowBackfillConsumer` | Backfill do feed ao ganhar novo seguidor |
| `biblioo.email` | `email.#` | `EmailConsumer` | E-mails transacionais (reset de senha, confirmações) |
| `biblioo.dna.recalculation` | `shelf.reading.* / feed.review.*` | `DnaRecalculationConsumer` | Recálculo do DNA Literário |

Todas as queues têm DLQ correspondente ligada ao exchange `biblioo.events.dlx`.

### Padrão Outbox — publicação transacional

O maior risco de mensageria é publicar no broker antes de a transação de banco confirmar. O Biblioo resolve isso com o Outbox Pattern: a mensagem é gravada no MySQL dentro da mesma transação que grava a entidade de negócio, e só publicada no RabbitMQ após o commit.

**Entidade** — [`OutboxEvent.java`](src/main/java/com/biblioo/infrastructure/messaging/model/OutboxEvent.java):

```java
// Campos: id (UUID), eventType, aggregateType, aggregateId,
//         routingKey, payload (JSON), status (PENDING/PROCESSED/FAILED),
//         attempts, errorMessage, createdAt, processedAt
@Entity
@Table(name = "outbox_events")
public class OutboxEvent { ... }
```

**Publicação só após commit** — [`OutboxEventService.java`](src/main/java/com/biblioo/infrastructure/messaging/service/OutboxEventService.java):

```java
@Transactional(propagation = Propagation.MANDATORY)
public OutboxEvent saveAndSchedulePublish(...) {
    OutboxEvent saved = outboxEventRepository.save(event); // grava no MySQL

    TransactionSynchronizationManager.registerSynchronization(
        new TransactionSynchronization() {
          @Override
          public void afterCommit() {
            eventPublisherPort.publish(saved); // só executa após commit
          }
        });

    return saved;
}
```

**Publisher** — [`RabbitMQEventPublisher.java`](src/main/java/com/biblioo/infrastructure/messaging/adapter/RabbitMQEventPublisher.java):

```java
rabbitTemplate.convertAndSend(RabbitMQConfig.MAIN_EXCHANGE, event.getRoutingKey(), message);
```

### Idempotência dos consumers

Cada consumer verifica o `event_id` antes de processar, prevenindo reprocessamento em reentregas pelo broker:

```java
// BecauseYouReadConsumer.java
@RabbitListener(queues = RabbitMQConfig.BYR_QUEUE, containerFactory = "becauseYouReadListenerFactory")
public void handle(EventMessage message) {
    if (eventLogRepository.existsByEventId(message.getEventId())) {
        return; // já processado — descarta silenciosamente
    }

    try {
        eventLogRepository.registerEvent(message.getEventId(), ...);
    } catch (DuplicateEventException ex) {
        log.warn("Race condition em event_id={}, descartando", message.getEventId());
        return;
    }

    becauseYouReadService.compute(userId, bookId, shelfItemId, finishedAt, seedBookTitle);
}
```

O mesmo padrão é aplicado em todos os consumers de recomendação.

### Chat em tempo real — WebSocket + RabbitMQ cross-instância

O chat usa WebSocket/STOMP para entrega local. Com múltiplas instâncias no Cloud Run, uma mensagem publicada na instância A precisa chegar aos clientes conectados na instância B. Isso é feito via FanoutExchange — cada instância tem uma fila anônima vinculada a esse exchange:

```java
// WebSocketMessageBroadcastAdapter.java
private void publishToOtherInstances(String destination, MessageEventPayload event) {
    CommunityBroadcastEnvelope envelope = new CommunityBroadcastEnvelope(destination, event);
    rabbitTemplate.convertAndSend(
        RabbitMQConfig.COMMUNITY_BROADCAST_EXCHANGE, "", envelope,
        msg -> {
            msg.getMessageProperties()
               .setHeader(HEADER_INSTANCE_ID, applicationInstanceId.getValue());
            return msg;
        });
}
```

O `CommunityBroadcastConsumer` descarta mensagens originadas pela própria instância (já entregues localmente via `SimpMessagingTemplate`) e entrega às demais via WebSocket.

### Notificações — RabbitMQ para in-app, FCM para push mobile

```mermaid
flowchart TD
    EVENT["Evento de domínio\n(follow, convite, aprovação...)"]
    OUTBOX["OutboxEventService\n@Transactional → afterCommit()"]
    RMQ["biblioo.notification\nrouting: notification.#"]
    CONSUMER["NotificationConsumer"]
    DB["MySQL · tabela notifications"]
    SSE["SSE /notifications/stream\nweb — app aberto"]
    FCM["Firebase FCM\nmobile — app fechado/background"]

    EVENT --> OUTBOX --> RMQ --> CONSUMER --> DB
    DB --> SSE
    DB --> FCM
```

O `NotificationConsumer` persiste a notificação e em seguida: (1) envia via SSE para clientes web conectados e (2) aciona Firebase FCM apenas se o usuário tiver device token registrado.

### Retry e DLQ

Consumers críticos têm retry com backoff exponencial. Mensagens que esgotam tentativas vão para a DLQ para inspeção e reprocessamento manual:

```java
// RabbitMQConfig.java
@Bean
Advice bookStatsRetryInterceptor() {
    return RetryInterceptorBuilder.stateless()
        .maxRetries(3)
        .backOffOptions(2_000, 2.0, 10_000) // 2s → 4s → 8s
        .build();
}
```

| Queue principal | DLQ |
|---|---|
| `biblioo.book.stats` | `biblioo.book.stats.dlq` |
| `biblioo.notification` | `biblioo.notification.dlq` |
| `rec.shelf.completed` | `rec.shelf.completed.dlq` |
| `biblioo.feed.fanout` | `biblioo.feed.fanout.dlq` |
| `biblioo.email` | `biblioo.email.dlq` |
| `biblioo.dna.recalculation` | `biblioo.dna.recalculation.dlq` |

---

## Testes de performance

O Biblioo executa operações computacionalmente pesadas: queries a cinco bancos distintos, algoritmos de grafo, fanout de feed e mensageria assíncrona. Por isso, requisitos de desempenho são tratados como cidadãos de primeira classe — latência máxima, taxa de erro tolerada e comportamento sob carga são definidos como SLAs explícitos e verificados automaticamente.

**71 testes — 100% aprovados.** A suíte cobre 8 domínios e 24 subdomínios, com três perfis por subdomínio:

| Perfil | Dinâmica de carga | Objetivo |
|---|---|---|
| `*-load.js` | VUs constantes por 2 min (até 600 VUs) | Latência p95 dentro do SLA em carga normal |
| `*-spike.js` | Salto abrupto para 500–600 VUs | Resiliência a bursts repentinos |
| `*-stress.js` | Rampa crescente até 400–800 VUs | Comportamento sob pressão máxima |

Os thresholds são declarados nos scripts e **reprovam o teste automaticamente** se violados — funcionam como assertions de desempenho na pipeline.

### Resultados da bateria de stress

| Subdomínio | VUs máx | Throughput | p(95) | Resultado |
|---|---|---|---|---|
| book | 400 | 545,6/s | 100,89 ms | PASSOU |
| shelfItem | 600 | 331,39/s | 717,87 ms | PASSOU |
| user | 600 | 833,75/s | 349,76 ms | PASSOU |
| social (grafo) | 200 | 287,85/s | 666,23 ms | PASSOU |
| feed | 600 | 413,77/s | 303,43 ms | PASSOU |
| post | 600 | 406,66/s | 505,61 ms | PASSOU |
| comment | 600 | 482,65/s | 304,66 ms | PASSOU |
| review | 600 | ~334/s | 928,98 ms | PASSOU |
| admin (comunidade) | 600 | ~568/s | 605,7 ms | PASSOU |
| message (WebSocket) | 250 | entrega 100% | 32 ms | PASSOU |
| recommendation (6 trilhas) | 400 | ~718/s | 1.210 ms | PASSOU |
| roll-dice | 800 | ~512/s | 420,03 ms | PASSOU |
| trending | 600 | ~300/s | 23,8 ms | PASSOU |
| shareCard | 600 | ~299,6/s | 57,42 ms | PASSOU |
| dna | 500 | 150,27/s | 29,88 ms | PASSOU |

**0 falhas sistêmicas (5xx)** em todos os 71 testes. Relatório completo: [`performance-tests/docs/RELATORIO-GERAL.md`](performance-tests/docs/RELATORIO-GERAL.md).

### Padrão dos testes autenticados

Domínios que exigem autenticação seguem um padrão com `setup()`: o script provisiona um pool de N usuários via `/auth/register`, faz login e armazena tokens JWT. Cada VU consome um token por round-robin, eliminando o custo de autenticação do caminho crítico medido.

Os testes de recomendação disparam as 6 trilhas em batch paralelo (`http.batch`) para simular o padrão real do app e revelar gargalos de concorrência entre trilhas que compartilham Neo4j e Redis.

```bash
# Exemplos de execução
k6 run performance-tests/DomainFeed/feed/feed-load.js
k6 run performance-tests/DomainRecommendation/recommendation/recommendation-spike.js
k6 run performance-tests/DomainBook/book/books-stress.js
```

---

## Variáveis de ambiente

Crie um arquivo `.env` na raiz de `back/`. **Nunca versionar em produção** — em produção os valores são injetados via Google Secret Manager.

```dotenv
# MySQL
MYSQL_PORT=3307
MYSQL_USER=biblioo
MYSQL_PASSWORD=senha_mysql
MYSQL_DATABASE=biblioo
MYSQL_ROOT_PASSWORD=root_senha
MYSQL_BIND_HOST=127.0.0.1
MYSQL_SLOW_QUERY_TIME=2
MYSQL_INNODB_BUFFER_POOL_SIZE=256M
MYSQL_INNODB_LOG_BUFFER_SIZE=64M
MYSQL_MAX_CONNECTIONS=100
MYSQL_THREAD_CACHE_SIZE=10
MYSQL_TABLE_OPEN_CACHE=2000
MYSQL_MEM_LIMIT=512m

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=senha_redis
REDIS_BIND_HOST=127.0.0.1
REDIS_MAXMEMORY=256mb
REDIS_MEM_LIMIT=320m

# RabbitMQ
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=biblioo
RABBITMQ_PASSWORD=senha_rabbit
RABBITMQ_VHOST=/
RABBITMQ_STOMP_PORT=61613
RABBITMQ_MANAGEMENT_PORT=15672
RABBITMQ_BIND_HOST=127.0.0.1
RABBITMQ_VM_MEMORY_HIGH_WATERMARK=0.4
RABBITMQ_DISK_FREE_LIMIT=50MB
RABBITMQ_MEM_LIMIT=512m

# OpenSearch
OPENSEARCH_HOST=localhost
OPENSEARCH_PORT=9200
OPENSEARCH_BIND_HOST=127.0.0.1
OPENSEARCH_CLUSTER_NAME=biblioo-cluster
OPENSEARCH_NODE_NAME=biblioo-node
OPENSEARCH_JAVA_OPTS=-Xms256m -Xmx256m
OPENSEARCH_MEM_LIMIT=512m
OPENSEARCH_DASHBOARDS_BIND_HOST=127.0.0.1
OPENSEARCH_DASHBOARDS_PORT=5601
OPENSEARCH_DASHBOARDS_MEM_LIMIT=512m

# Neo4j
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=senha_neo4j
NEO4J_BIND_HOST=127.0.0.1
NEO4J_HTTP_PORT=7474
NEO4J_BOLT_PORT=7687
NEO4J_HEAP_INITIAL=256m
NEO4J_HEAP_MAX=512m
NEO4J_PAGECACHE=256m
NEO4J_MEM_LIMIT=1g

# Segurança
JWT_SECRET=chave_jwt_minimo_256_bits

# Seed de dados (desenvolvimento)
BIBLIOO_SEED_ENABLED=true

# Trending (ajuste para desenvolvimento)
# trending.window-hours=9999
# trending.book.min-interactions=1

# APIs externas
GOOGLE_BOOKS_API_KEY=sua_chave_google_books
GOOGLE_CLIENT_ID=seu_client_id_google
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
FIREBASE_SERVICE_ACCOUNT_BASE64=base64_do_service_account_json
SENDGRID_API_KEY=sua_chave_sendgrid
SENDGRID_FROM_EMAIL=noreply@seudominio.com
GEMINI_API_KEY=sua_chave_gemini

# E-mail SMTP (backup do SendGrid)
GMAIL_EMAIL=seu_email@gmail.com
GMAIL_PASSWORD=app_password_gmail

# URLs
FRONTEND_URL=http://localhost:3000
APP_WEBSOCKET_ALLOWED_ORIGINS=http://localhost:3000
PASSWORD_RESET_PATH=/reset-password
MOBILE_DEEP_LINK_URL=biblioo://
MOBILE_RESET_PATH=/reset-password

# Observabilidade
GRAFANA_USER=admin
GRAFANA_PASSWORD=senha_grafana
```

---

## Instalação e execução

### Pré-requisitos

- Java 25+
- Maven 3.9+
- Docker + Docker Compose
- K6 (opcional, para testes de performance)

### Passo a passo

```bash
# 1. Clone o repositório
git clone https://github.com/ICEI-PUC-Minas-PPLES-TI/plf-es-2026-1-ti5-0492100-biblioo.git
cd plf-es-2026-1-ti5-0492100-biblioo/code/back

# 2. Crie e preencha o .env
cp .env.example .env

# 3. Suba a infraestrutura
docker-compose up -d

# 4. Aguarde os healthchecks passarem (MySQL ~30s, OpenSearch ~60s, Neo4j ~60s)
docker-compose ps

# 5. Formate o código (obrigatório antes de qualquer commit)
./mvnw spotless:apply

# 6. Suba a aplicação
./mvnw spring-boot:run
```

### Acessos após subir

| Serviço | URL | Credenciais |
|---|---|---|
| API REST | `http://localhost:8080` | JWT Bearer token |
| Swagger UI | `http://localhost:8080/swagger-ui.html` | — |
| Grafana | `http://localhost:3001` | `GRAFANA_USER` / `GRAFANA_PASSWORD` |
| Prometheus | `http://localhost:9090` | — |
| RabbitMQ Management | `http://localhost:15672` | `RABBITMQ_USER` / `RABBITMQ_PASSWORD` |
| Neo4j Browser | `http://localhost:7474` | `NEO4J_USER` / `NEO4J_PASSWORD` |

### Build e testes

```bash
./mvnw clean package      # build completo
./mvnw test               # testes unitários
./mvnw spotless:check     # verifica formatação sem alterar arquivos
```

---

## Deploy em nuvem

A aplicação roda em dois ambientes independentes no **Google Cloud Run** (us-central1). Os serviços de banco de dados, cache, mensageria e grafo são compartilhados entre ambientes via provedores gerenciados externos ao Google Cloud.

### Ambientes

| | Portfolio | Produção |
|---|---|---|
| Serviço Cloud Run | `biblioo-portfolio` | `biblioo-producao` |
| URL pública | `biblioo-portfolio-595140312227.us-central1.run.app` | `biblioo-producao-595140312227.us-central1.run.app` |
| Memória / CPU | 1 Gi / 1 vCPU | 2 Gi / 2 vCPU |
| Instâncias mín./máx. | 0 / 2 — hiberna sem tráfego | 1 / 10 — sempre ativa |
| Concorrência | 80 req/instância | 200 req/instância |
| CPU Boost no cold start | — | sim |
| Session affinity (WebSocket) | sim | sim |
| Timeout | 3600 s | 3600 s |
| OpenSearch | Bonsai.io Hobby (HTTPS, free tier) | GCE VM e2-small (HTTP, VPC interna) |
| MySQL | TiDB Cloud Serverless | TiDB Cloud Serverless |
| Redis | Upstash | Upstash |
| RabbitMQ | CloudAMQP Little Lemur | CloudAMQP Little Lemur |
| Neo4j | Aura Free | Aura Free |
| Custo | $0/mês | ~$13/mês (VM GCE) |

### Pipeline CI/CD

```mermaid
flowchart TD
    A["Repo privado\npush em main · dev · prod"]
    B["GitHub Actions\nEspelha branches no repo público"]
    C["Repo público\npush na branch prod"]
    D["Cloud Build trigger\nAtivado somente em ^prod$"]
    S1["Step 1: docker build ./code/back"]
    S2["Step 2: docker push → Artifact Registry"]
    S3["Step 3: gcloud run deploy biblioo-portfolio"]
    S4["Step 4: gcloud run deploy biblioo-producao\nTroca de revisão sem downtime — ~12 min"]

    A --> B --> C --> D --> S1 --> S2 --> S3 --> S4
```

| Componente | Função |
|---|---|
| GitHub Actions | Espelha main, dev e prod do repo privado pro público em tempo real |
| `cloudbuild.yaml` | Define os 4 steps do pipeline automatizado |
| Artifact Registry | Armazena `backend:latest` — cada build substitui a versão anterior |
| Secret Manager | 40+ secrets injetados via `--set-secrets` — nunca expostos no código |
| Cloud Build trigger | `^prod$` — deploy ativado exclusivamente por push na branch prod |

### Estratégia OpenSearch por ambiente

**Portfolio — Bonsai.io Hobby:** Cloud Run conecta via HTTPS com Basic Auth. Um job semanal (`OpenSearchIndexCleanupService`) reconcilia o índice com o MySQL, removendo documentos órfãos e logando estatísticas de tamanho a cada hora.

**Produção — GCE VM e2-small:** OpenSearch roda em Docker na VM com `discovery.type=single-node`. A porta 9200 é bloqueada por firewall para internet — acessível apenas via rede VPC interna (`10.128.0.0/9`). Cloud Run conecta pelo IP interno da VM.

```bash
# Acessar a VM (produção)
gcloud compute ssh biblioo-infra --zone=us-central1-a
curl http://localhost:9200/_cluster/health
sudo docker logs opensearch --tail=50
```

### Gestão de secrets

```bash
# Criar novo secret
echo -n "VALOR" | gcloud secrets create "NOME" --data-file=-
gcloud run services update biblioo-portfolio \
  --region=us-central1 --update-secrets="NOME=NOME:latest"

# Atualizar valor
echo -n "NOVO_VALOR" | gcloud secrets versions add "NOME" --data-file=-

# Remover de um serviço
gcloud run services update biblioo-portfolio \
  --region=us-central1 --remove-env-vars="NOME"
```

### Operações comuns

```bash
# Logs em tempo real
gcloud run services logs read biblioo-producao --region=us-central1 --limit=100

# Health check
curl https://biblioo-producao-595140312227.us-central1.run.app/actuator/health | jq

# Deploy manual (hotfix urgente)
gcloud builds submit \
  --tag us-central1-docker.pkg.dev/helical-decoder-451221-i0/biblioo-repo/backend:latest \
  --timeout=20m ./code/back

gcloud run deploy biblioo-producao \
  --image=us-central1-docker.pkg.dev/helical-decoder-451221-i0/biblioo-repo/backend:latest \
  --region=us-central1
```

### Guia de upgrade por sintoma

| Sintoma | Ação recomendada |
|---|---|
| Cold start lento no portfolio | `--min-instances=1` — elimina a hibernação |
| Alta latência em busca (produção) | Migrar VM para e2-medium ou aumentar `-Xmx` do OpenSearch |
| Alta latência em busca (portfolio) | Upgrade Bonsai.io Standard (~$20/mês) |
| Alta latência no feed ou recomendações | Upgrade Upstash (mais comandos/s) |
| Erros 429 ou lentidão no banco | Upgrade TiDB Cloud Serverless |
| Muitos usuários simultâneos (> 200) | Aumentar `--max-instances` no Cloud Run |
| Mensagens acumuladas no RabbitMQ | Upgrade CloudAMQP Lemur |

---

## Observabilidade

Métricas expostas via `/actuator/prometheus` (scraped pelo Prometheus):

- Histograma de latência HTTP com percentis (p50, p95, p99)
- Pool de conexões HikariCP (ativo, inativo, aguardando)
- Consumer lag do RabbitMQ por queue
- Contadores customizados nos algoritmos de recomendação (Micrometer)
- JVM: heap, GC, threads

O arquivo `config/grafana.json` importa um dashboard pré-configurado com os principais indicadores. O `config/prometheus/prometheus.yml` configura o scrape do endpoint `/actuator/prometheus`.

Endpoints de health:

```bash
# Saúde geral (inclui MySQL, Redis, RabbitMQ)
GET /actuator/health

# Métricas Prometheus
GET /actuator/prometheus
```

---

## Padrão de código

O projeto usa **Google Java Format 1.35.0** via **Spotless**, aplicado obrigatoriamente antes de qualquer commit:

```bash
./mvnw spotless:apply   # formata
./mvnw spotless:check   # valida sem alterar
```

- Código em inglês
- Comentários, logs e mensagens de exceção em pt-BR
- Sem comentários que expliquem *o quê* o código faz — apenas *por quê* (invariantes não óbvios, workarounds)
- Nenhum `@SuppressWarnings` sem comentário explicativo

---

## Regras de arquitetura

| Regra | Motivação |
|---|---|
| Neo4j via `neo4j-java-driver` com Cypher raw — nunca `spring-data-neo4j` | Controle total sobre queries de recomendação — abstrações do SDN interferem no plano de execução |
| `schema.sql` roda a cada startup (`spring.sql.init.mode=always`) | Garante índices e colunas complementares sempre presentes sem depender de migration tool |
| Consumers verificam `event_id` antes de processar | Idempotência — garante que reentregas pelo broker não causem efeitos duplicados |
| Publicação no RabbitMQ dentro de `@Transactional` apenas via `OutboxEvent` | Evita mensagens publicadas antes do commit da entidade de domínio |
| `open-in-view=false` — não reverter | Previne N+1 em requests assíncronos e sessões Hibernate abertas desnecessariamente |
| `JwtAuthenticationFilter` nunca bypassed | Endpoints públicos declarados explicitamente em `SecurityConfig` — default é autenticado |
| Parâmetros `recommendation.*` sempre via `@Value` — nunca hardcoded | Permite tuning em produção via Secret Manager sem recompilação |
| Cache nunca armazena `null` (`cache-null-values=false`) | Evita cache poisoning — ausência de dado é representada por lista vazia, não null cacheado |
| Módulos nunca importam classes de outros módulos diretamente | Comunicação apenas via eventos de domínio ou através de ports declarados |

---

## Tecnologias e dependências

| Categoria | Tecnologia | Versão |
|---|---|---|
| Linguagem | Java | 25 |
| Framework | Spring Boot | 4.0.4 |
| Banco relacional | MySQL + HikariCP | 8.4 |
| Grafo | Neo4j Java Driver | 5.18.0 |
| Cache | Redis (Spring Data) | 7.4 |
| Busca | OpenSearch REST Client | 2.11.1 |
| Mensageria | RabbitMQ + Spring AMQP | 4.0 |
| WebSocket | Spring WebSocket + STOMP + Reactor Netty | — |
| IA | Spring AI + Google Gemini GenAI API | 2.0.0-M5 |
| Push notifications | Firebase Admin SDK | 9.4.1 |
| OAuth | Google API Client | 2.2.0 |
| Imagens | Cloudinary HTTP5 | 2.0.0 |
| E-mail | SendGrid + Spring Mail (SMTP) | — |
| Segurança JWT | JJWT | 0.12.6 |
| Rate limiting | Bucket4j | 8.10.1 |
| Anti-XSS | JSoup | 1.17.2 |
| File detection | Apache Tika | 3.2.3 |
| Mapeamento DTO | MapStruct | 1.5.5.Final |
| Retry | Spring Retry + AspectJ | 2.0.11 |
| Documentação | Springdoc OpenAPI (Swagger UI) | 2.8.8 |
| Métricas | Micrometer + Prometheus | — |
| Formatação | Spotless + Google Java Format | 2.44.4 / 1.35.0 |
| Build | Maven | 3.9+ |
| Containers | Docker Compose | — |
| Testes de carga | K6 | — |
| Deploy | Google Cloud Run | — |
| CI/CD | Cloud Build + GitHub Actions | — |
| Registry | Google Artifact Registry | — |
| Secrets | Google Secret Manager | — |
| VM OpenSearch (produção) | Google Compute Engine e2-small | — |
| MySQL gerenciado | TiDB Cloud Serverless | — |
| Redis gerenciado | Upstash | — |
| RabbitMQ gerenciado | CloudAMQP Little Lemur | — |
| OpenSearch gerenciado (portfolio) | Bonsai.io Hobby | — |
| Grafo gerenciado | Neo4j Aura Free | — |

---

## APIs e endpoints

Documentação interativa disponível em `http://localhost:8080/swagger-ui.html` após subir a aplicação.

### Autenticação (`/auth`)

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/auth/register` | Cadastro com e-mail e senha |
| `POST` | `/auth/login` | Login → access + refresh token |
| `POST` | `/auth/refresh` | Renovar access token |
| `POST` | `/auth/logout` | Invalidar refresh token |
| `POST` | `/auth/google` | Login via Google OAuth |
| `POST` | `/auth/create-password` | Criar senha para contas criadas via Google |
| `POST` | `/auth/forgot-password` | Enviar e-mail de redefinição |
| `POST` | `/auth/reset-password` | Redefinir senha com token |

### Usuários (`/users`)

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/users/me` | Perfil do usuário autenticado |
| `PUT` | `/users/me` | Atualizar username, bio, avatar, banner |
| `PUT` | `/users/me/visibility` | Alternar perfil público/privado |
| `POST` | `/users/me/avatar` | Upload de avatar (Cloudinary, async) |
| `POST` | `/users/me/banner` | Upload de banner (Cloudinary, async) |
| `DELETE` | `/users/me` | Excluir conta |
| `GET` | `/users/{username}` | Perfil público |
| `POST` | `/users/{username}/follow` | Seguir (204 público · 202 privado) |
| `DELETE` | `/users/{username}/follow` | Deixar de seguir |
| `GET` | `/users/{username}/followers` | Lista paginada de seguidores |
| `GET` | `/users/{username}/following` | Lista paginada de seguidos |
| `GET` | `/users/me/follow-requests` | Solicitações de follow pendentes |
| `POST` | `/users/me/follow-requests/{username}/accept` | Aceitar solicitação |
| `DELETE` | `/users/me/follow-requests/{username}` | Rejeitar solicitação |
| `GET` | `/users` | Busca por prefixo de username (OpenSearch, mín. 2 chars) |

### Livros (`/books`)

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/books/search` | Busca por título, autor ou ISBN (OpenSearch + Google Books) |
| `GET` | `/books/{id}` | Detalhes do livro |

### Gêneros (`/genres`)

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/genres` | Lista todos os gêneros com tradução pt-BR (cache 6h) |

### Estantes (`/shelves`)

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/shelves` | Listar estantes do usuário autenticado |
| `GET` | `/shelves/{shelfId}` | Detalhes de uma estante |
| `GET` | `/shelves/user/{userId}` | Estantes públicas de outro usuário |
| `GET` | `/shelves/me/active-reading-days` | Streak de leitura |
| `POST` | `/shelves` | Criar estante |
| `PUT` | `/shelves/{shelfId}` | Atualizar estante |
| `DELETE` | `/shelves/{shelfId}` | Excluir estante e todos os itens |

### Itens de estante (`/shelves/{shelfId}/items`)

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/shelves/{shelfId}/items` | Listar itens |
| `POST` | `/shelves/{shelfId}/items` | Adicionar livro à estante |
| `DELETE` | `/shelves/{shelfId}/items/{itemId}` | Remover livro |
| `PATCH` | `/shelves/{shelfId}/items/{itemId}/progress` | Atualizar página atual |
| `PATCH` | `/shelves/{shelfId}/items/{itemId}/status` | Mudar status (QUERO_LER → LENDO → LIDO) |

### Coleções (`/collections`)

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/collections` | Listar coleções do usuário |
| `GET` | `/collections/{collectionId}` | Detalhes com preview das estantes |
| `GET` | `/collections/{collectionId}/statistics` | Estatísticas agregadas |
| `POST` | `/collections` | Criar coleção |
| `PUT` | `/collections/{collectionId}` | Editar nome/descrição |
| `PATCH` | `/collections/{collectionId}/shelves` | Adicionar estante |
| `DELETE` | `/collections/{collectionId}/shelves/{shelfId}` | Remover estante |
| `DELETE` | `/collections/{collectionId}` | Excluir coleção |

### Feed (`/feed`)

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/feed` | Feed personalizado (cursor-based, máx. 50 itens por página) |
| `POST` | `/feed/posts` | Publicar post (texto, até 5 imagens, 1 GIF, tags, spoiler, livro associado) |
| `PUT` | `/feed/posts/{postId}` | Editar post |
| `DELETE` | `/feed/posts/{postId}` | Excluir post |
| `POST` | `/feed/posts/{postId}/like` | Curtir / descurtir |
| `POST` | `/feed/posts/{postId}/comments` | Comentar |
| `DELETE` | `/feed/posts/{postId}/comments/{commentId}` | Excluir comentário |
| `POST` | `/feed/reviews` | Criar review (nota 1–5, texto opcional) |
| `PUT` | `/feed/reviews/{reviewId}` | Editar review |
| `DELETE` | `/feed/reviews/{reviewId}` | Excluir review |
| `POST` | `/feed/reviews/{reviewId}/like` | Curtir / descurtir |

### Comunidades (`/communities`)

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/communities` | Criar comunidade |
| `GET` | `/communities/{id}` | Detalhes (com role do viewer) |
| `GET` | `/communities` | Listar/buscar (paginado) |
| `GET` | `/communities/mine` | Comunidades do usuário autenticado |
| `PUT` | `/communities/{id}` | Editar |
| `DELETE` | `/communities/{id}` | Soft-delete |
| `POST` | `/communities/{id}/join` | Entrar em comunidade pública |
| `DELETE` | `/communities/{id}/leave` | Sair |
| `POST` | `/communities/{id}/invite-link` | Gerar / regenerar link de convite |
| `POST` | `/communities/join/{token}` | Entrar via link de convite |
| `POST` | `/communities/{id}/invites` | Convidar usuário diretamente |
| `POST` | `/communities/invites/{inviteId}/accept` | Aceitar convite |
| `POST` | `/communities/{id}/join-requests` | Solicitar entrada em comunidade privada |
| `POST` | `/communities/join-requests/{requestId}/approve` | Aprovar solicitação |
| `POST` | `/communities/join-requests/{requestId}/reject` | Rejeitar solicitação |

### Votação de livros (`/communities/{communityId}/votings`)

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/communities/{communityId}/votings` | Criar votação (estado draft) |
| `POST` | `/communities/{communityId}/votings/{votingId}/publish` | Publicar |
| `POST` | `/communities/{communityId}/votings/{votingId}/vote` | Registrar / desfazer voto |
| `POST` | `/communities/{communityId}/votings/{votingId}/close` | Encerrar antecipadamente |
| `POST` | `/communities/{communityId}/votings/{votingId}/approve` | Aprovar resultado |
| `POST` | `/communities/{communityId}/votings/{votingId}/reject` | Rejeitar resultado |

### Recomendações (`/recommendations`)

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/recommendations/because-you-read` | T1 — co-leitura via Neo4j |
| `GET` | `/recommendations/favorite-genre-now` | T2 — 3 gêneros dominantes |
| `GET` | `/recommendations/trending-in-communities` | T3 — decay exponencial de engajamento |
| `GET` | `/recommendations/catalog-surprise` | T4 — Thompson Sampling |
| `GET` | `/recommendations/similar-authors` | T5 — filtragem colaborativa 2 níveis |
| `GET` | `/recommendations/reread-worth-it` | T6 — repetição espaçada |
| `GET` | `/recommendations/roll-dice` | Roll Dice — seleção aleatória das 6 trilhas |

### Outros módulos

| Módulo | Rota base | Destaques |
|---|---|---|
| DNA Literário | `/dna` | Perfil com arquétipo, temas, velocidade e taxa de abandono. Mínimo de 5 livros lidos para ativação. |
| Trending | `/trending/books` e `/trending/communities` | Top 10 por atividade nas últimas 48h (configurável). Retorna título, autores e métricas de interação recente. Cache Redis, refresh a cada 15 min. Requer autenticação. |
| Notificações | `/notifications` | SSE para web · FCM para mobile · histórico paginado · badge de não lidas · gestão de device tokens |
| Assistente Bibo | `/assistant` | Chat com Gemini via Spring AI, histórico no Redis (TTL 24h), rate limit 20 req/min, executa ações na plataforma |
| Importação | `/import` | Importação de biblioteca Goodreads via CSV (máx. 10 MB / 10.000 linhas) |
| Share | `/share` | Cards de compartilhamento social gerados como imagem no backend |
| Preferências | `/preferences` | Gêneros e livros favoritos (onboarding). POST único combina gêneros + livros. |

---

<div align="center">
  <img width="70%" alt="pucminas" src="../../docs/imagens/banner-institucional.svg"/>
</div>
<p align="center">Fonte do banner: <a href="https://github.com/joaopauloaramuni">João Paulo Carneiro Aramuni</a></p>

---
