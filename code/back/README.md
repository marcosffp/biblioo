<!--
<div align="center" style="background:#1a1a2e;padding:32px 0;border-radius:12px">
<div align="center" style="background:#3fc3a7;padding:32px 80px;border-radius:12px;width:85%">
-->
<img width="1600" style="height:auto; border-radius: 12px;" alt="banner" src="../../docs/imagens/banner.png" />

# Backend

> Rede social de leitura com estantes, reviews, comunidades com chat em tempo real, notificações push, recomendações personalizadas geradas por diferentes algoritmos de recomendação e um assistente de IA conversacional.

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
![Cloud Run](https://img.shields.io/badge/Cloud_Run-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white)
![Cloud Build](https://img.shields.io/badge/Cloud_Build-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)
![TiDB Cloud](https://img.shields.io/badge/TiDB_Cloud-E1012B?style=for-the-badge&logo=tidb&logoColor=white)
![Upstash](https://img.shields.io/badge/Upstash-00E9A3?style=for-the-badge&logo=upstash&logoColor=white)
![CloudAMQP](https://img.shields.io/badge/CloudAMQP-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)
![Bonsai.io](https://img.shields.io/badge/Bonsai.io-005EB8?style=for-the-badge&logo=opensearch&logoColor=white)
![Neo4j Aura](https://img.shields.io/badge/Neo4j_Aura-008CC1?style=for-the-badge&logo=neo4j&logoColor=white)
![GCE](https://img.shields.io/badge/Compute_Engine-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white)
![Secret Manager](https://img.shields.io/badge/Secret_Manager-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white)

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
- [Deploy em nuvem](#-deploy-em-nuvem)
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

O sistema de recomendação é o **diferencial central do Biblioo**. São seis trilhas independentes, cada uma com uma estratégia distinta para cobrir ângulos diferentes de descoberta de leitura — de comportamento social a aprendizado adaptativo. Nenhuma usa IA generativa: os resultados são gerados por algoritmos determinísticos e estatísticos, acionados por eventos de domínio via RabbitMQ e cacheados no Redis por usuário.

---

#### 🔗 T1 — BecauseYouRead `rec-byr`

> *"Quem leu o mesmo livro que você também leu estes..."*

A trilha de co-leitura conecta leitores pelo título em comum. Quando o usuário conclui um livro, o sistema navega o grafo Neo4j para encontrar outros usuários que leram o mesmo título e retorna os livros que eles também leram — mas que o usuário ainda não conhece. Quanto mais leitores em comum, mais forte o sinal.

**Como funciona:** grava `(:User)-[:READ]->(:Book)` · filtra por `min-co-readers: 2` · aplica jitter ±3% para diversificar listas entre usuários · cap de 60% por categoria · fallback automático para SQL se o Neo4j estiver indisponível

---

#### 🎯 T2 — FavoriteGenreNow `rec-fgn`

> *"Você está numa fase de ficção científica — aqui estão os melhores títulos que ainda não leu."*

Detecta os **3 gêneros dominantes no momento atual** do usuário (não o histórico de todos os tempos, mas o que ele está lendo agora) e busca os melhores livros desses gêneros que ele ainda não conhece.

**Como funciona:** estágio 1 prioriza livros com avaliações suficientes (`min-reviews: 10`); se não preencher os 20 slots, estágio 2 completa por popularidade (`reader_count`) · resultado persistido com os nomes dos gêneros para exibição no app

---

#### 📈 T3 — TrendingInCommunities `rec-tic`

> *"Este livro está em alta nas comunidades agora — as pessoas estão comentando muito sobre ele."*

Capta o que está gerando engajamento real nas comunidades em tempo real. Cada mensagem publicada ou nova entrada em uma comunidade incrementa o score do livro vinculado. O score decai naturalmente com o tempo, garantindo que só o que é relevante **agora** aparece.

**Como funciona:** pesos por evento — mensagem `2.0` · entrada `0.5` · deduplicação por janela de 24h por usuário/livro · decay de 10%/hora · resultado combina camada orgânica (score > `0.1`) + fallback dos últimos 60 dias

---

#### 🎲 T4 — CatalogSurprise `rec-cs`

> *"Saia da zona de conforto — aqui está algo diferente do que você costuma ler, mas que faz sentido para o seu perfil."*

A trilha que combate o efeito de bolha. Propõe livros de **categorias distantes do perfil habitual** do usuário usando Thompson Sampling — um algoritmo bayesiano que aprende com cada interação. Cada livro concluído reforça positivamente; cada livro abandonado reforça negativamente. Livros sem histórico têm prior uniforme e sempre têm chance real de aparecer.

**Como funciona:** parâmetros α/β por `(userId, bookId)` persistidos no Redis por 90 dias · concluído → `α++` · abandonado → `β++` · score = `θ ~ Beta(α,β) × score_base` · TTL curto preserva a natureza estocástica entre sessões

---

#### 👥 T5 — SimilarAuthors `rec-sa`

> *"Leitores com gosto parecido com o seu adoraram estes livros — e são de autores que você ainda não explorou."*

Combina duas fontes: o próprio histórico do usuário e o comportamento de leitores similares navegando o grafo Neo4j. O resultado mistura descoberta pessoal com descoberta social.

**Como funciona:** **L1** — livros de autores já bem avaliados pelo próprio usuário (`min-rating: 4`) · **L2** — Neo4j 2 saltos até 30 usuários similares → livros que avaliaram bem · L2 com score alto pode superar L1 (zona de sobreposição `[0.6–0.7]` intencional)

---

#### 🔄 T6 — RereadWorthIt `rec-rwi`

> *"Faz um tempo que você leu este livro — pode ser o momento certo para revisitá-lo."*

A única trilha focada em releitura. Usa repetição espaçada para calcular, livro a livro, o momento ideal para reler com base na nota que o usuário deu e em quantas vezes já releu. Quanto maior a nota e mais releituras confirmadas, maior o intervalo sugerido.

**Como funciona:** `intervalo = avaliação × 30 dias × 1.5^n_releituras` · ex: nota 5, 1ª vez → 150 dias · score = `0.7 × maturity + 0.3 × (avaliação / 5.0)` · livros dentro do intervalo ficam ocultos · `reread_count` rastreado em JSON de metadados por conta da constraint única em `shelf_items`

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

## 🐳 Infraestrutura Docker (desenvolvimento local)

O `docker-compose.yml` sobe todos os serviços de infraestrutura localmente. A aplicação Spring Boot roda fora do Compose (via `./mvnw spring-boot:run`). Em produção, cada serviço é substituído por um provedor gerenciado — veja [Deploy em nuvem](#-deploy-em-nuvem).

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

O Biblioo executa operações computacionalmente pesadas: consultas a seis bancos de dados distintos, algoritmos de grafo (Neo4j), fanout de feed para milhares de seguidores e mensageria assíncrona. Por isso, **requisitos não funcionais de desempenho** são tratados como cidadãos de primeira classe — latência máxima aceitável, taxa de erro tolerada e comportamento sob carga inesperada são definidos como SLAs explícitos e verificados automaticamente pelos testes.

Os testes são escritos em **K6** e organizados por domínio. Cada domínio possui **três perfis obrigatórios**, cada um validando um aspecto diferente de resiliência:

| Perfil | Dinâmica de carga | Objetivo |
|---|---|---|
| `*-load.js` | VUs constantes por 2 min (ex: 80 VUs em busca + 20 VUs em detalhes simultaneamente) | Valida que a latência p95 permanece dentro do SLA em uso normal sustentado |
| `*-spike.js` | Base (50 VUs) → pico brusco (300 VUs em 5 s) → queda → recuperação | Valida que o sistema absorve bursts repentinos sem degradar além do limiar e se recupera |
| `*-stress.js` | Estágios crescentes: 20 → 50 → 100 → 200 → 300 → 400 VUs (30 s cada) | Encontra o ponto de ruptura e mede a degradação progressiva |

### SLAs definidos por endpoint (thresholds K6)

Os thresholds são declarados diretamente nos scripts e fazem o teste **falhar** automaticamente se forem violados — funcionam como assertions de desempenho na pipeline:

| Domínio / endpoint | p95 máximo | Taxa de erro máxima |
|---|---|---|
| Busca de livros (`/books/search`) | 2 000 ms | 1% |
| Detalhes de livro (`/books/{id}`) | 800 ms | 1% |
| Feed do usuário (`/feed`) | 1 500 ms | 1% |
| BecauseYouRead | 800 ms | 1% |
| FavoriteGenreNow | 800 ms | 1% |
| TrendingInCommunities | 900 ms | 1% |
| CatalogSurprise (Thompson Sampling) | 1 200 ms | 1% |
| SimilarAuthors (Neo4j 2 níveis) | 1 100 ms | 1% |
| RereadWorthIt | 800 ms | 1% |
| Geral (fallback todos os endpoints) | 1 000–1 500 ms | 1–5% |

> CatalogSurprise e SimilarAuthors têm SLAs mais altos: o primeiro envolve leitura/escrita stateful de parâmetros bayesianos no Redis; o segundo percorre dois níveis de relacionamento no grafo Neo4j.

### Padrão dos testes autenticados

Domínios que exigem autenticação (feed, recommendations, community, user) seguem um padrão com `setup()`: antes do teste começar, o script provisiona um **pool de N usuários** — registra cada um via `/auth/register`, faz login e armazena o token. Durante a execução, cada VU consome um token do pool por round-robin, eliminando o custo de autenticação do caminho crítico medido.

Os testes de recomendação disparam as **6 trilhas em batch paralelo** (`http.batch`) para simular o padrão real da aplicação, onde todas são carregadas juntas na tela inicial. Isso também revela gargalos de concorrência entre trilhas que compartilham Neo4j ou Redis.

### Estrutura de arquivos

```
performance-tests/
├── DomainBook/
│   ├── book/           books-load.js · books-spike.js · books-stress.js
│   ├── collection/     collection-load.js · collection-spike.js · collection-stress.js
│   ├── shelf/          shelf-load.js · shelf-spike.js · shelf-stress.js
│   └── shelfItem/      shelfItem-load.js · shelfItem-spike.js · shelfItem-stress.js
├── DomainCommunity/
│   ├── community/      community-load.js · community-spike.js · community-stress.js
│   ├── message/        message-load.js · message-spike.js · message-stress.js
│   └── voting/         voting-load.js · voting-spike.js · voting-stress.js
├── DomainDna/          dna-load.js · dna-spike.js · dna-stress.js
├── DomainFeed/
│   ├── feed/           feed-load.js · feed-spike.js · feed-stress.js
│   ├── post/           post-load.js · post-spike.js · post-stress.js
│   ├── review/         review-load.js · review-spike.js · review-stress.js
│   └── comment/        comment-load.js · comment-spike.js · comment-stress.js
├── DomainRecommendation/
│   ├── recommendation/ recommendation-load.js · recommendation-spike.js · recommendation-stress.js
│   └── roll-dice/      roll-dice-load.js · roll-dice-spike.js · roll-dice-stress.js
├── DomainTrending/     trending-load.js · trending-spike.js · trending-stress.js
└── DomainUser/         user-load.js · user-spike.js · user-stress.js
```

```bash
# Carga normal — busca de livros (80 VUs busca + 20 VUs detalhes por 2 min)
k6 run performance-tests/DomainBook/book/books-load.js

# Spike — todas as 6 trilhas de recomendação em batch paralelo
k6 run performance-tests/DomainRecommendation/recommendation/recommendation-spike.js

# Stress progressivo — feed (fanout + Redis sliding window)
k6 run performance-tests/DomainFeed/feed/feed-stress.js
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

## 🌐 Deploy em Nuvem

A aplicação roda em dois ambientes independentes no **Google Cloud Run** (us-central1), cada um com OpenSearch dedicado e políticas de escalonamento distintas. Os serviços de banco de dados, cache, mensageria e grafo são compartilhados entre os ambientes via provedores gerenciados externos ao Google Cloud.

### Ambientes

| | **Portfolio** | **Produção** |
|---|---|---|
| Serviço Cloud Run | `biblioo-portfolio` | `biblioo-producao` |
| URL pública | `https://biblioo-portfolio-595140312227.us-central1.run.app` | `https://biblioo-producao-595140312227.us-central1.run.app` |
| Memória / CPU | 1 Gi / 1 vCPU | 2 Gi / 2 vCPU |
| Instâncias mín./máx. | 0 / 2 — hiberna sem tráfego | 1 / 10 — sempre ativa |
| Concorrência | 80 req/instância | 200 req/instância |
| CPU Boost no cold start | — | ✅ |
| Session affinity (WebSocket) | ✅ | ✅ |
| Timeout | 3600 s | 3600 s |
| **OpenSearch** | **Bonsai.io Hobby** — HTTPS, free tier permanente | **GCE VM e2-small** — HTTP, rede interna VPC |
| MySQL | TiDB Cloud Serverless | TiDB Cloud Serverless |
| Redis | Upstash | Upstash |
| RabbitMQ | CloudAMQP Little Lemur | CloudAMQP Little Lemur |
| Neo4j | Aura Free | Aura Free |
| Custo | $0/mês (free tiers permanentes) | ~$13/mês (VM GCE) — coberto pelos $300 de crédito GCP |

### Pipeline CI/CD

```
Repo privado (organização)
    │  push em main · dev · prod
    ▼
GitHub Actions                    .github/workflows/mirror-and-deploy.yml
    │  espelha as branches no repo público preservando histórico de commits
    ▼
Repo público (marcosffp/biblioo)
    │  push na branch prod
    ▼
Cloud Build trigger (deploy-prod)   ativado somente em ^prod$
    │
    ├─ Step 1  docker build ./code/back
    ├─ Step 2  docker push → Artifact Registry  (backend:latest)
    ├─ Step 3  gcloud run deploy biblioo-portfolio
    └─ Step 4  gcloud run deploy biblioo-producao
               ↑ troca de revisão sem downtime — ~12 min do push ao deploy
```

| Componente | Função |
|---|---|
| **GitHub Actions** | Espelha main, dev e prod do repo privado pro público em tempo real |
| **`cloudbuild.yaml`** (raiz do repo) | Define os 4 steps do pipeline automatizado |
| **Artifact Registry** | Armazena `backend:latest` — cada build substitui a versão anterior |
| **Secret Manager** | 40+ secrets injetados via `--set-secrets` — nunca expostos no código ou no repositório |
| **Cloud Build trigger** | `^prod$` — deploy ativado exclusivamente por push na branch prod |

### Estratégia OpenSearch por ambiente

**Portfolio — Bonsai.io Hobby (gratuito para sempre)**

```
Cloud Run (biblioo-portfolio)
    │  HTTPS :443  ·  Basic Auth (header Authorization)
    ▼
Bonsai.io (imaginative-holly-*.bonsaisearch.net)
    ├── 125 MB storage  ·  1 shard  ·  sem prazo de expiração
    └── OpenSearchIndexCleanupService — limpeza semanal automática
        reconcilia índice com MySQL, remove documentos órfãos
        stats de tamanho logados a cada hora via Cloud Run Logging
```

**Produção — GCE VM e2-small (rede interna VPC)**

```
Cloud Run (biblioo-producao)
    │  HTTP :9200  ·  sem autenticação  ·  IP interno 10.128.0.2
    ▼
VM biblioo-infra  (e2-small · us-central1-a · 30 GB SSD)
    └── opensearch:2.18.0 em Docker
        discovery.type=single-node · DISABLE_SECURITY_PLUGIN=true
        -Xms512m -Xmx512m · restart=always

Regra de firewall biblioo-infra-internal
    └── tcp:9200 · source 10.128.0.0/9
        porta nunca exposta à internet — só o Cloud Run acessa via VPC interna
```

### Escalonamento

O Cloud Run monitora a concorrência de cada instância e sobe novas automaticamente conforme a demanda:

```
requisições ativas > concurrency × instâncias_atuais ?
            │                          │
           Não                        Sim
            │                          │
       mantém estado            sobe nova instância
                                (até max-instances)
                                Cloud Run decide em segundos
```

**Guia de upgrade por sintoma:**

| Sintoma | Ação recomendada |
|---|---|
| Cold start lento no portfolio | `--min-instances=1` — elimina a hibernação |
| Alta latência em busca de livros (produção) | Migrar VM para e2-medium ou aumentar `-Xmx` do OpenSearch |
| Alta latência em busca de livros (portfolio) | Upgrade Bonsai.io Standard (~$20/mês) |
| Alta latência no feed ou recomendações | Upgrade Upstash (mais comandos/s) |
| Erros 429 ou lentidão no banco | Upgrade TiDB Cloud Serverless |
| Muitos usuários simultâneos (> 200) | Aumentar `--max-instances` no Cloud Run |
| RabbitMQ com mensagens acumuladas | Upgrade CloudAMQP Lemur |

**WebSocket com múltiplas instâncias:**

`--session-affinity` garante que o mesmo cliente permaneça na mesma instância durante toda a conexão STOMP. Para mensagens que precisam cruzar instâncias, o fanout é feito via RabbitMQ FanoutExchange — `WebSocketMessageBroadcastAdapter` publica e `CommunityBroadcastConsumer` entrega em cada instância ativa. O SimpleBroker em memória gerencia apenas as sessões locais de cada instância.

### Gestão de secrets

```bash
# Criar e registrar novo secret
echo -n "VALOR" | gcloud secrets create "NOME" --data-file=-
gcloud run services update biblioo-portfolio \
  --region=us-central1 --update-secrets="NOME=NOME:latest"

# Atualizar valor (serviço pega :latest automaticamente no próximo start)
echo -n "NOVO_VALOR" | gcloud secrets versions add "NOME" --data-file=-

# Remover de um serviço e deletar o secret
gcloud run services update biblioo-portfolio \
  --region=us-central1 --remove-env-vars="NOME"
gcloud secrets delete "NOME"
```

> Aplicar os mesmos comandos em `biblioo-producao` quando a alteração precisar refletir nos dois ambientes.

### Operações comuns

```bash
# Ver logs em tempo real
gcloud run services logs read biblioo-producao --region=us-central1 --limit=100
gcloud run services logs read biblioo-portfolio --region=us-central1 --limit=100

# Health check dos serviços
curl https://biblioo-producao-595140312227.us-central1.run.app/actuator/health | jq
curl https://biblioo-portfolio-595140312227.us-central1.run.app/actuator/health | jq

# Build + deploy manual sem pipeline (ex: hotfix urgente)
gcloud builds submit \
  --tag us-central1-docker.pkg.dev/helical-decoder-451221-i0/biblioo-repo/backend:latest \
  --timeout=20m ./code/back

gcloud run deploy biblioo-portfolio \
  --image=us-central1-docker.pkg.dev/helical-decoder-451221-i0/biblioo-repo/backend:latest \
  --region=us-central1

gcloud run deploy biblioo-producao \
  --image=us-central1-docker.pkg.dev/helical-decoder-451221-i0/biblioo-repo/backend:latest \
  --region=us-central1

# Acessar VM do OpenSearch (produção)
gcloud compute ssh biblioo-infra --zone=us-central1-a
curl http://localhost:9200/_cluster/health
sudo docker logs opensearch --tail=50
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
| Deploy | Google Cloud Run | — |
| CI/CD | Cloud Build + GitHub Actions | — |
| Registry de imagens | Google Artifact Registry | — |
| Secrets em produção | Google Secret Manager | — |
| VM OpenSearch (produção) | Google Compute Engine e2-small | — |
| MySQL gerenciado | TiDB Cloud Serverless | — |
| Redis gerenciado | Upstash | — |
| RabbitMQ gerenciado | CloudAMQP Little Lemur | — |
| OpenSearch gerenciado (portfolio) | Bonsai.io Hobby | — |
| Grafo gerenciado | Neo4j Aura Free | — |

---

<div align="center">
  <img width="70%" alt="pucminas" src="../../docs/imagens/banner-institucional.svg"/>
</div>
<p align="center">Fonte do banner: <a href="https://github.com/joaopauloaramuni">João Paulo Carneiro Aramuni</a></p>

---
