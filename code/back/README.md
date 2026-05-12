# Biblioo — Backend

> Rede social de leitura com estantes, reviews, comunidades com chat em tempo real, notificações push/SSE, recomendações personalizadas via grafo e assistente de IA.

---

## 🛠️ Stack Principal

![Java](https://img.shields.io/badge/Java-25-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.0.4-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.4-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Neo4j](https://img.shields.io/badge/Neo4j-5.18-008CC1?style=for-the-badge&logo=neo4j&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7.4-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![OpenSearch](https://img.shields.io/badge/OpenSearch-2.18-005EB8?style=for-the-badge&logo=opensearch&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-4.0-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)

---

## 📑 Sumário

- [Sobre o projeto](#-sobre-o-projeto)
- [Arquitetura](#-arquitetura)
- [Estrutura de módulos](#-estrutura-de-módulos)
- [Estrutura de pastas](#-estrutura-de-pastas)
- [APIs e endpoints](#-apis-e-endpoints)
- [Infraestrutura Docker](#-infraestrutura-docker)
- [Testes de performance](#-testes-de-performance)
- [Variáveis de ambiente](#-variáveis-de-ambiente)
- [Instalação e execução](#-instalação-e-execução)
- [Observabilidade](#-observabilidade)
- [Padrão de código](#-padrão-de-código)
- [Regras de arquitetura](#-regras-de-arquitetura)
- [Tecnologias e dependências](#-tecnologias-e-dependências)

---

## 📖 Sobre o projeto

O **Biblioo** é uma rede social focada em leitores. Os usuários organizam seus livros em estantes personalizadas, escrevem reviews, interagem em comunidades com chat em tempo real (WebSocket/STOMP via RabbitMQ), recebem notificações push (Firebase FCM) e têm acesso a recomendações geradas por seis algoritmos distintos que combinam grafo de relacionamentos (Neo4j), colaboração entre usuários e aprendizado bayesiano (Thompson Sampling). O assistente **Bibo**, alimentado pelo Google Gemini, transforma linguagem natural em ações dentro da plataforma. Além de responder perguntas e recomendar leituras, ele é capaz de criar comunidades, organizar estantes, montar coleções e auxiliar usuários na utilização do ecossistema social do Biblioo de forma contextual e automatizada.

---

## 🏛️ Arquitetura

A aplicação segue o estilo **Hexagonal (Ports & Adapters)** em uma arquitetura de **monólito modular**, garantindo desacoplamento entre domínios e permitindo que módulos específicos possam ser extraídos futuramente para serviços independentes conforme a necessidade de escalabilidade da plataforma.

```
┌─────────────────────────────────────────────────────────────┐
│                        Web Layer                            │
│          REST Controllers  ·  WebSocket Handlers            │
└────────────────────────┬────────────────────────────────────┘
                         │  UseCase (porta de entrada)
┌────────────────────────▼────────────────────────────────────┐
│                     Domain / Services                       │
│   Regras de negócio puras — sem dependência de framework    │
└──────┬──────────────┬──────────────┬───────────────┬────────┘
       │              │              │               │
  Persistence    Messaging      External APIs     Cache
  (JPA/MySQL)  (RabbitMQ/       (Google Books,   (Redis)
  (Neo4j raw)   Outbox)          Cloudinary,
                                  Firebase,
                                  Gemini)
```

**Padrões centrais:**

| Padrão | Onde se aplica |
|---|---|
| Outbox | Publicação assíncrona no RabbitMQ dentro de `@Transactional` |
| Fanout-on-write | Feed com threshold de 10.000 seguidores |
| Thompson Sampling | Trilha T4 — CatalogSurprise |
| Spaced Repetition | Trilha T6 — RereadWorthIt |
| Exponential Decay | Trilha T3 — TrendingInCommunities |
| Collaborative Filtering | Trilha T5 — SimilarAuthors via Neo4j |
| Sliding Window Cache | Feed Redis com warm-size de 200 itens |
| Idempotência por `event_id` | Todos os consumers RabbitMQ com persistência |

---

## 🧩 Estrutura de módulos

| Módulo | Responsabilidade | Arquivos Java |
|---|---|---|
| `books` | Catálogo, estantes, coleções, histórico de leitura, busca via OpenSearch | ~67 |
| `community` | Comunidades, chat WebSocket, votação de livros, convites, solicitações | ~98 |
| `dna` | DNA Literário — cálculo de perfil de leitura do usuário | ~9 |
| `feed` | Feed personalizado, posts, reviews, comentários, curtidas, fanout | ~68 |
| `infrastructure` | Config global, seeding, Outbox, rate limiting, Cloudinary, OpenSearch | ~30+ |
| `notification` | Notificações in-app e push via Firebase FCM | ~6 |
| `recommendation` | 6 algoritmos de recomendação (ver detalhes abaixo) | ~24 |
| `share` | Geração de cards de compartilhamento social | ~4 |
| `trending` | Top 10 livros e comunidades em tendência (refresh a cada 15 min) | ~5 |
| `user` | Autenticação, perfil, seguidores, busca por username | ~67 |
| `assistant` | Assistente Bibo com Google Gemini, function calling, histórico Redis | ~21 |

### 🤖 Algoritmos de Recomendação

| Trilha | Algoritmo | Descrição |
|---|---|---|
| T1 — BecauseYouRead | Co-leitura via Neo4j | Livros lidos por quem leu o mesmo que você |
| T2 — FavoriteGenreNow | Top gêneros recentes | Baseado nos 3 gêneros mais lidos nos últimos 30 dias |
| T3 — TrendingInCommunities | Exponential Decay | Score decai 10% por hora; atividade de comunidades |
| T4 — CatalogSurprise | Thompson Sampling (Multi-Armed Bandit) | Aprendizado bayesiano com alpha/beta persistidos no Redis por 90 dias |
| T5 — SimilarAuthors | Collaborative Filtering | Usuários similares via grafo Neo4j (2 níveis de relacionamento) |
| T6 — RereadWorthIt | Spaced Repetition | Sugere releitura após 90 dias com fator de espaçamento 1.5× |

---

## 📁 Estrutura de pastas

```
back/
├── config/
│   ├── grafana.json                  # Dashboard Grafana pré-configurado
│   ├── prometheus/
│   │   └── prometheus.yml            # Scrape configs (Spring Actuator)
│   └── rabbitmq/
│       └── enabled_plugins           # Habilita stomp, management
├── performance-tests/
│   ├── DomainBook/                   # K6: livros, coleções, estantes
│   ├── DomainCommunity/              # K6: comunidades, votação, convites
│   ├── DomainDna/                    # K6: DNA Literário
│   ├── DomainFeed/                   # K6: feed, posts, reviews
│   ├── DomainRecommendation/         # K6: algoritmos de recomendação
│   ├── DomainTrending/               # K6: trending books e communities
│   └── DomainUser/                   # K6: usuários, autenticação, seguidores
├── src/
│   └── main/
│       ├── java/com/biblioo/
│       │   ├── BibliooApplication.java
│       │   ├── assistant/            # Assistente Bibo (Gemini)
│       │   ├── books/                # Catálogo e estantes
│       │   ├── community/            # Chat e comunidades
│       │   ├── dna/                  # DNA Literário
│       │   ├── feed/                 # Feed e posts
│       │   ├── infrastructure/       # Config global e seeding
│       │   ├── notification/         # Notificações
│       │   ├── recommendation/       # Algoritmos de recomendação
│       │   ├── share/                # Compartilhamento
│       │   ├── trending/             # Tendências
│       │   └── user/                 # Usuários e autenticação
│       └── resources/
│           ├── application.properties
│           └── schema.sql            # DDL complementar (roda a cada startup)
├── docker-compose.yml
├── pom.xml
└── .env                              # Nunca versionar em produção
```

---

## 🌐 APIs e endpoints

Documentação interativa disponível em `http://localhost:8080/swagger-ui.html` após subir a aplicação.

### Usuários (`/users`)

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/users/me` | Perfil do usuário autenticado |
| `PUT` | `/users/me` | Atualizar username, bio, avatar, banner |
| `PUT` | `/users/me/visibility` | Alternar perfil público/privado |
| `POST` | `/users/me/avatar` | Upload de avatar (Cloudinary) |
| `POST` | `/users/me/banner` | Upload de banner (Cloudinary) |
| `GET` | `/users/{username}` | Perfil público de um usuário |
| `POST` | `/users/{username}/follow` | Seguir usuário (204 público · 202 privado) |
| `DELETE` | `/users/{username}/follow` | Deixar de seguir |
| `GET` | `/users/{username}/followers` | Lista de seguidores |
| `GET` | `/users/{username}/following` | Lista de seguidos |
| `GET` | `/users/me/follow-requests` | Solicitações pendentes |
| `POST` | `/users/me/follow-requests/{user}/accept` | Aceitar solicitação |
| `DELETE` | `/users/me/follow-requests/{user}` | Rejeitar solicitação |
| `DELETE` | `/users/me` | Excluir conta |
| `GET` | `/users` | Busca por prefixo de username (OpenSearch) |

### Autenticação (`/auth`)

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/auth/register` | Cadastro com e-mail e senha |
| `POST` | `/auth/login` | Login → access + refresh token |
| `POST` | `/auth/refresh` | Renovar access token |
| `POST` | `/auth/logout` | Invalidar refresh token |
| `POST` | `/auth/google` | Login via Google OAuth |
| `POST` | `/auth/forgot-password` | Enviar e-mail de redefinição |
| `POST` | `/auth/reset-password` | Redefinir senha com token |

### Livros (`/books`)

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/books/search` | Busca por título, autor ou ISBN (OpenSearch + Google Books) |
| `GET` | `/books/{id}` | Detalhes do livro |

### Estantes (`/shelves`)

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/shelves` | Listar estantes do usuário |
| `POST` | `/shelves` | Criar estante |
| `PUT` | `/shelves/{id}` | Renomear estante |
| `DELETE` | `/shelves/{id}` | Excluir estante |
| `POST` | `/shelves/{id}/items` | Adicionar livro à estante |
| `DELETE` | `/shelves/{id}/items/{bookId}` | Remover livro |

### Coleções (`/collections`)

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/collections` | Listar coleções públicas |
| `POST` | `/collections` | Criar coleção |
| `PUT` | `/collections/{id}` | Editar coleção |
| `DELETE` | `/collections/{id}` | Excluir coleção |

### Feed (`/feed`)

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/feed` | Feed paginado do usuário autenticado |
| `POST` | `/feed/posts` | Publicar post |
| `DELETE` | `/feed/posts/{id}` | Excluir post |
| `POST` | `/feed/posts/{id}/like` | Curtir post |
| `DELETE` | `/feed/posts/{id}/like` | Descurtir post |

### Reviews (`/reviews`)

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/reviews` | Criar review de um livro |
| `GET` | `/reviews/book/{bookId}` | Reviews de um livro |
| `PUT` | `/reviews/{id}` | Editar review |
| `DELETE` | `/reviews/{id}` | Excluir review |
| `POST` | `/reviews/{id}/like` | Curtir review |

### Comentários (`/comments`)

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/comments` | Comentar em post ou review |
| `GET` | `/comments/{targetType}/{targetId}` | Listar comentários |
| `DELETE` | `/comments/{id}` | Excluir comentário |
| `POST` | `/comments/{id}/like` | Curtir comentário |

### Comunidades (`/communities`)

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/communities` | Criar comunidade |
| `GET` | `/communities/{id}` | Detalhes (com role do viewer) |
| `PUT` | `/communities/{id}` | Editar nome/descrição |
| `POST` | `/communities/{id}/join` | Solicitar entrada |
| `POST` | `/communities/{id}/invites` | Convidar usuário |
| `GET` | `/communities/{id}/messages` | Histórico de mensagens |
| `GET` | `/communities/{id}/voting` | Votação de livro ativa |
| `POST` | `/communities/{id}/voting` | Criar votação |
| `POST` | `/communities/{id}/voting/vote` | Registrar voto |

### Recomendações (`/recommendations`)

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/recommendations` | Lista combinada das 6 trilhas |
| `GET` | `/recommendations/because-you-read` | Trilha T1 |
| `GET` | `/recommendations/favorite-genre` | Trilha T2 |
| `GET` | `/recommendations/trending-communities` | Trilha T3 |
| `GET` | `/recommendations/catalog-surprise` | Trilha T4 |
| `GET` | `/recommendations/similar-authors` | Trilha T5 |
| `GET` | `/recommendations/reread-worth-it` | Trilha T6 |

### Outros

| Módulo | Rota base | Destaques |
|---|---|---|
| DNA Literário | `/dna` | Perfil, arquétipos literários, histórico de snapshots |
| Trending | `/trending` | Top 10 livros e comunidades (cache Redis) |
| Notificações | `/notifications` | Listagem, marcar como lida, registrar device token FCM |
| Assistente Bibo | `/assistant` | Chat com Gemini, histórico de conversa, function calling |
| Share | `/share` | Geração de cards de compartilhamento |

---

## 🐳 Infraestrutura Docker

O `docker-compose.yml` sobe todos os serviços de infraestrutura. A aplicação Spring Boot roda fora do Compose (via `./mvnw spring-boot:run`).

| Serviço | Imagem | Porta padrão | Função |
|---|---|---|---|
| `biblioo-mysql` | `mysql:8.4` | `3306` | Banco relacional principal |
| `biblioo-redis` | `redis:7.4-alpine` | `6379` | Cache, sessões, bandit params |
| `biblioo-rabbitmq` | `rabbitmq:4.0-management-alpine` | `5672` / `15672` / `61613` | Mensageria + STOMP WebSocket relay |
| `biblioo-opensearch` | `opensearchproject/opensearch:2.18.0` | `9200` | Busca full-text (livros e usuários) |
| `biblioo-neo4j` | `neo4j:5.18` | `7474` / `7687` | Grafo de recomendações |
| `biblioo-prometheus` | `prom/prometheus:v2.53.0` | `9090` | Coleta de métricas |
| `biblioo-grafana` | `grafana/grafana:10.4.5` | `3001` | Dashboards de observabilidade |
| `biblioo-opensearch-dashboards` | `opensearchproject/opensearch-dashboards:2.18.0` | `5601` | UI do OpenSearch (perfil `tools`) |

> Os serviços `mysql`, `redis`, `rabbitmq` e `opensearch` possuem healthcheck configurado.
> O `opensearch-dashboards` só sobe com `docker-compose --profile tools up`.

```bash
# Subir infraestrutura completa
docker-compose up -d

# Subir com OpenSearch Dashboards
docker-compose --profile tools up -d
```

---

## 📊 Testes de performance

Testes escritos em **K6** cobrindo todos os domínios com três perfis de carga cada:

| Perfil | Objetivo |
|---|---|
| `*-load.js` | Carga sustentada — simula uso normal em produção |
| `*-spike.js` | Pico repentino — valida comportamento sob burst de tráfego |
| `*-stress.js` | Estresse progressivo — encontra o ponto de ruptura |

```
performance-tests/
├── DomainBook/          book · collection · shelf · shelfItem
├── DomainCommunity/     community · manage · invites · join-requests · voting
├── DomainDna/           dna profile e snapshots
├── DomainFeed/          feed · posts · reviews · comments
├── DomainRecommendation/ as 6 trilhas de recomendação
├── DomainTrending/      trending books e communities
└── DomainUser/          register · login · follow · search
```

```bash
# Exemplo: teste de carga no domínio de livros
k6 run performance-tests/DomainBook/book-load.js
```

---

## 🔑 Variáveis de ambiente

Crie um arquivo `.env` na raiz de `back/` com as variáveis abaixo. **Nunca versionar em produção.**

```dotenv
# ── MySQL ──────────────────────────────────────
MYSQL_PORT=3306
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

# ── Redis ──────────────────────────────────────
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=senha_redis
REDIS_BIND_HOST=127.0.0.1
REDIS_MAXMEMORY=256mb
REDIS_MEM_LIMIT=320m

# ── RabbitMQ ───────────────────────────────────
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

# ── OpenSearch ─────────────────────────────────
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

# ── Neo4j ──────────────────────────────────────
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

# ── Segurança ──────────────────────────────────
JWT_SECRET=chave_jwt_minimo_256_bits

# ── APIs externas ──────────────────────────────
GOOGLE_BOOKS_API_KEY=sua_chave_google_books
GOOGLE_CLIENT_ID=seu_client_id_google
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
FIREBASE_SERVICE_ACCOUNT_BASE64=base64_do_service_account_json
SENDGRID_API_KEY=sua_chave_sendgrid
SENDGRID_FROM_EMAIL=noreply@seudominio.com
GEMINI_API_KEY=sua_chave_gemini

# ── E-mail SMTP (backup) ───────────────────────
GMAIL_EMAIL=seu_email@gmail.com
GMAIL_PASSWORD=app_password_gmail

# ── URLs da aplicação ──────────────────────────
FRONTEND_URL=http://localhost:3000
APP_WEBSOCKET_ALLOWED_ORIGINS=http://localhost:3000
PASSWORD_RESET_PATH=/reset-password
MOBILE_DEEP_LINK_URL=biblioo://
MOBILE_RESET_PATH=/reset-password

# ── Observabilidade ────────────────────────────
GRAFANA_USER=admin
GRAFANA_PASSWORD=senha_grafana
```

---

## 🚀 Instalação e execução

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

# 2. Crie e preencha o arquivo .env (ver seção acima)
cp .env.example .env

# 3. Suba a infraestrutura
docker-compose up -d

# 4. Aguarde todos os healthchecks passarem (MySQL ~30s, OpenSearch ~60s, Neo4j ~60s)
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
| RabbitMQ | `http://localhost:15672` | `RABBITMQ_USER` / `RABBITMQ_PASSWORD` |
| Neo4j Browser | `http://localhost:7474` | `NEO4J_USER` / `NEO4J_PASSWORD` |

### Build e testes

```bash
# Build completo
./mvnw clean package

# Testes unitários
./mvnw test

# Verificar formatação sem alterar arquivos
./mvnw spotless:check
```

---

## 📡 Observabilidade

**Métricas expostas** via `/actuator/prometheus`:
- Histograma de latência HTTP com percentis (p50, p95, p99)
- Métricas de pool de conexões HikariCP
- Consumer lag do RabbitMQ
- Contadores customizados nos algoritmos de recomendação (Micrometer)

O arquivo `config/grafana.json` pode ser importado diretamente no Grafana para um dashboard pré-configurado com os principais indicadores da aplicação.

O `config/prometheus/prometheus.yml` configura o scrape do endpoint `/actuator/prometheus` da aplicação.

---

## 🎨 Padrão de código

O projeto usa **Google Java Format 1.35.0** via **Spotless**, aplicado obrigatoriamente antes de qualquer commit:

```bash
./mvnw spotless:apply   # formata
./mvnw spotless:check   # valida sem alterar
```

**Regras gerais:**
- Código em inglês
- Comentários, logs e mensagens de exceção em pt-BR
- Sem comentários que expliquem *o quê* o código faz — apenas *por quê* (invariantes não óbvios, workarounds)

---

## 🔒 Regras de arquitetura

| Regra | Motivação |
|---|---|
| Neo4j via `neo4j-java-driver` com Cypher raw — nunca `spring-data-neo4j` | Controle total sobre queries de recomendação |
| `schema.sql` roda a cada startup (`spring.sql.init.mode=always`) | Garante índices e colunas complementares sempre presentes |
| Consumers RabbitMQ verificam `event_id` antes de processar | Idempotência — referência: `BecauseYouReadConsumer` |
| Publicação no RabbitMQ dentro de `@Transactional` apenas via `OutboxEvent` | Evita mensagens publicadas sem commit da entidade |
| `open-in-view=false` — não reverter | Previne N+1 em requests assíncronos |
| `JwtAuthenticationFilter` nunca bypassed | Endpoints públicos declarados explicitamente em `SecurityConfig` |
| Parâmetros `recommendation.*` sempre via `@Value` — nunca hardcoded | Permite tuning sem recompilação |
| Cache nunca armazena `null` (`cache-null-values=false`) | Evita cache poisoning |

---

## 📦 Tecnologias e dependências

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

---

<div align="center">
  Biblioo — Leitura conectada
</div>
