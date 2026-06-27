# Relatório Geral de Performance — Biblioo Backend

> **Data de referência:** 2026-06-24  
> **Ferramenta:** k6 (Grafana) v1.7.1  
> **Ambiente:** localhost:8080  
> **Domínios cobertos:** 8 (DomainBook, DomainCommunity, DomainDna, DomainFeed, DomainRecommendation, DomainShare, DomainTrending, DomainUser)

---

## 1. Status Geral

**72 de 72 testes executados — 100% aprovados.**

| Domain | Subdomínios | Testes | Status |
|--------|-------------|--------|--------|
| DomainBook | book, collection, shelf, shelfItem | 12/12 | Completo |
| DomainCommunity | community, invites, join-requests, manage, messageRest, voting, message (WS), admin | 21/21 | Completo |
| DomainDna | dna | 3/3 | Completo |
| DomainFeed | feed, post, comment, commentInteraction, review | 15/15 | Completo |
| DomainRecommendation | recommendation, roll-dice | 6/6 | Completo |
| DomainShare | shareCard | 3/3 | Completo |
| DomainTrending | trending | 3/3 | Completo |
| DomainUser | user, social (público + privado) | 9/9 | Completo |

---

## 2. Ambiente

| Item | Configuração |
|------|--------------|
| **Máquina** | Apple M3 Pro · 11 núcleos · 18 GB RAM · macOS 26.5.1 |
| **Aplicação** | Spring Boot 4 / Java 25, `localhost:8080` |
| **Banco relacional** | MySQL 8.4 (Docker) |
| **Cache** | Redis 7.4 (Docker) |
| **Mensageria** | RabbitMQ 4.0 (Docker) |
| **Busca** | OpenSearch 2.18 (Docker) |
| **Grafo social** | Neo4j 5.18 (Docker) |
| **Gerador de carga** | k6 v1.7.1 |

> Testes rodaram em máquina única, com a aplicação e toda a infraestrutura compartilhando os mesmos recursos — os números representam um **piso conservador** de desempenho.

---

## 3. Resultados por Domain

---

### 3.1 DomainBook — Catálogo, coleções e prateleiras

> Relatório detalhado: [`../DomainBook/RELATORIO-DOMAINBOOK.md`](../DomainBook/RELATORIO-DOMAINBOOK.md)

| Subdomínio | Teste | VUs máx | Requests | Throughput | p(95) | Falhas | Status |
|------------|-------|---------|----------|-----------|-------|--------|--------|
| book | load | 100 | 14.160 | 117.82/s | 33.83ms | 0% | Aprovado |
| book | spike | 300 | 32.462 | 646.66/s | 18.91ms | 0% | Aprovado |
| book | stress | 400 | 114.684 | 545.6/s | 100.89ms | 0% | Aprovado |
| collection | load | 210 | 57.031 | 424.57/s | 34.44ms | 0% | Aprovado |
| collection | spike | 500 | 32.148 | 397.02/s | 574.91ms | 0% | Aprovado |
| collection | stress | 600 | 165.283 | 593.97/s | 250.07ms | 0% | Aprovado |
| shelf | load | 210 | 50.980 | 384.72/s | 47.24ms | 0% | Aprovado |
| shelf | spike | 500 | 37.507 | 500.90/s | 396.55ms | 0% | Aprovado |
| shelf | stress | 600 | 164.588 | 594.4/s | 128.61ms | 0% | Aprovado |
| shelfItem | load | 210 | 54.130 | 402.25/s | 43.89ms | 0% | Aprovado |
| shelfItem | spike | 500 | 27.632 | 344.98/s | 475.65ms | 0% | Aprovado |
| shelfItem | stress | 600 | 103.345 | 331.39/s | 717.87ms | 0% | Aprovado |

**Load**

<img src="../evidencias/load/DomainBook-books-load.png" width="700">
<img src="../evidencias/load/DomainBook-collection-load.png" width="700">
<img src="../evidencias/load/DomainBook-shelf-load.png" width="700">
<img src="../evidencias/load/DomainBook-shelfItem-load.png" width="700">

**Spike**

<img src="../evidencias/spike/DomainBook-books-spike.png" width="700">
<img src="../evidencias/spike/DomainBook-collection-spike.png" width="700">
<img src="../evidencias/spike/DomainBook-shelf-spike.png" width="700">
<img src="../evidencias/spike/DomainBook-shelfItem-spike.png" width="700">

**Stress**

<img src="../evidencias/stress/DomainBook-book-stress.png" width="700">
<img src="../evidencias/stress/DomainBook-collection-stress.png" width="700">
<img src="../evidencias/stress/DomainBook-shelf-stress.png" width="700">
<img src="../evidencias/stress/DomainBook-shelfItem-stress.png" width="700">

---

### 3.2 DomainUser — Perfil, autenticação e grafo social

> Relatório detalhado: [`../DomainUser/RELATORIO-DOMAINUSER.md`](../DomainUser/RELATORIO-DOMAINUSER.md)

| Subdomínio | Teste | VUs máx | Requests | Throughput | p(95) | Falhas | Status |
|------------|-------|---------|----------|-----------|-------|--------|--------|
| user | load | 210 | 51.960 | 391.31/s | 56.7ms | 0% | Aprovado |
| user | spike | 500 | 34.860 | 462.80/s | 15.46ms | 0% | Aprovado |
| user | stress | 600 | 269.802 | 833.75/s | 349.76ms | 0% | Aprovado |
| social (público) | load | 210 | 89.682 | 672.18/s | 27.34ms | 0% | Aprovado |
| social (público) | spike | 500 | 43.290 | 552.00/s | 333.3ms | 0% | Aprovado |
| social (público) | stress | 200¹ | 142.582 | 287.85/s | 666.23ms | 0%² | Aprovado |
| social-requests (privado) | load | 100 | 32.400 | 245.30/s | 62.26ms | 0% | Aprovado |
| social-requests (privado) | spike | 500 | 47.436 | 585.13/s | 354.09ms | 4.74%³ | Aprovado |
| social-requests (privado) | stress | 250 | 157.722 | 603.53/s | 45.4ms | 9.08%³ | Aprovado |

¹ Script atualizado para 200 VUs (4 estágios). Ver §3.2 do relatório de domínio para contexto completo.  
² 1 falha em 142.582 requests (0.00%); thresholds HTTP aprovados. Backend assíncrono (RabbitMQ consumers) falhou por exaustão de pool JDBC sob ~288 events/s sustentados — invisível ao k6. Ver relatório de domínio §2.1.2.  
³ Conflitos de negócio esperados (4xx) sob contenção — sem race patológica, 100% dos checks passaram. Ver relatório de domínio §2.2.1 e §2.3.

**Load**

<img src="../evidencias/load/DomainUser-user-load.png" width="700">
<img src="../evidencias/load/DomainUser-social-load.png" width="700">
<img src="../evidencias/load/DomainUser-social-requests-load.png" width="700">

**Spike**

<img src="../evidencias/spike/DomainUser-user-spike.png" width="700">
<img src="../evidencias/spike/DomainUser-social-spike.png" width="700">
<img src="../evidencias/spike/DomainUser-social-requests-spike.png" width="700">

**Stress**

<img src="../evidencias/stress/DomainUser-user-stress.png" width="700">
<img src="../evidencias/stress/DomainUser-social-stress.png" width="700">
<img src="../evidencias/stress/DomainUser-social-requests-stress.png" width="700">

---

### 3.3 DomainFeed — Feed, posts, comentários e reviews

> Relatório detalhado: [`../DomainFeed/RELATORIO-DOMAINFEED.md`](../DomainFeed/RELATORIO-DOMAINFEED.md)

| Subdomínio | Teste | VUs máx | Requests | Throughput | p(95) | Falhas | Status |
|------------|-------|---------|----------|-----------|-------|--------|--------|
| feed | load | 210 | 30.567 | 230.50/s | 66.86ms | 0% | Aprovado |
| feed | spike | 500 | 30.292 | 389.31/s | 324.16ms | 0% | Aprovado |
| feed | stress | 600 | 116.816 | 413.77/s | 303.43ms | 0% | Aprovado |
| post | load | 210 | 54.013 | 403.46/s | 44.39ms | 0% | Aprovado |
| post | spike | 500 | 25.432 | 325.92/s | 633.43ms | 0% | Aprovado |
| post | stress | 600 | 115.560 | 406.66/s | 505.61ms | 0% | Aprovado |
| comment | load | 210 | 51.158 | 365.47/s | 80.13ms | 0% | Aprovado |
| comment | spike | 500 | 26.491 | 279.86/s | 743.68ms | 0% | Aprovado |
| comment | stress | 600 | 143.688 | 482.65/s | 304.66ms | 0% | Aprovado |
| commentInteraction | load | 210 | 51.207 | 356.71/s | 68.48ms | 0% | Aprovado |
| commentInteraction | spike | 500 | 22.587 | 218.73/s | 1.03s | 0% | Aprovado |
| commentInteraction | stress | 200¹ | 40.352 | 203.58/s | 36.92ms | 0% | Aprovado |
| review | load | 210 | 51.913 | 338.42/s | 58.64ms | 0% | Aprovado |
| review | spike | 500 | 34.807 | 134.76/s | 681.75ms | 0% | Aprovado |
| review | stress | 600 | ~98.720² | ~334/s² | 928.98ms | 0% | Aprovado |

¹ Script atualizado para 4 estágios (max 200 VUs); p(95) baixo reflete carga moderada.  
² Inclui ~18.400 requests de setup pesado (800 usuários × 23 req). Taxa efetiva durante fase de VUs (~4m): ~334/s.

**Load**

<img src="../evidencias/load/DomainFeed-feed-load.png" width="700">
<img src="../evidencias/load/DomainFeed-post-load.png" width="700">
<img src="../evidencias/load/DomainFeed-comment-load.png" width="700">
<img src="../evidencias/load/DomainFeed-commentInteraction-load.png" width="700">
<img src="../evidencias/load/DomainFeed-review-load.png" width="700">

**Spike**

<img src="../evidencias/spike/DomainFeed-feed-spike.png" width="700">
<img src="../evidencias/spike/DomainFeed-post-spike.png" width="700">
<img src="../evidencias/spike/DomainFeed-comment-spike.png" width="700">
<img src="../evidencias/spike/DomainFeed-commentInteraction-spike.png" width="700">
<img src="../evidencias/spike/DomainFeed-review-spike.png" width="700">

**Stress**

<img src="../evidencias/stress/DomainFeed-feed-stress.png" width="700">
<img src="../evidencias/stress/DomainFeed-post-stress.png" width="700">
<img src="../evidencias/stress/DomainFeed-comment-stress.png" width="700">
<img src="../evidencias/stress/DomainFeed-commentInteraction-stress.png" width="700">
<img src="../evidencias/stress/DomainFeed-review-stress.png" width="700">

---

### 3.4 DomainCommunity — Comunidades, mensagens, enquetes e administração

> Relatório detalhado: [`../DomainCommunity/RELATORIO-DOMAINCOMMUNITY.md`](../DomainCommunity/RELATORIO-DOMAINCOMMUNITY.md)

| Subdomínio | Teste | VUs máx | Requests | Throughput | p(95) | Falhas | Status |
|------------|-------|---------|----------|-----------|-------|--------|--------|
| community | load | 90 | 25.326 | 192.57/s | 15.88ms | 0% | Aprovado |
| community | spike | 200 | 13.564 | 255.07/s | 22.5ms | 0% | Aprovado |
| community | stress | 500 | 102.449 | 476.49/s | 699.66ms | 0% | Aprovado |
| community-invites | load | 210 | 62.321 | 471.55/s | 28.04ms | 0% | Aprovado |
| community-invites | stress | 500 | 130.917 | 469.97/s | 428.42ms | 6.86%¹ | Aprovado |
| community-join-requests | load | 210 | 54.607 | ~412/s | 107.08ms | 0% | Aprovado |
| community-join-requests | stress | 600 | 86.079 | 306.72/s | 1.38s | 16.99%² | Aprovado |
| community-manage | stress | 200 | 106.973 | 497.33/s | 29.55ms | 0% | Aprovado |
| admin | load | 210 | 86.935 | ~615/s | 96.74ms | 0% | Aprovado |
| admin | spike | 500 | 30.397 | 303.64/s | 955.92ms | 0% | Aprovado |
| admin | stress | 600 | 164.801 | ~568/s | 605.7ms | 0% | Aprovado |
| messageRest | load | 120 | 29.092 | 191.89/s | 94.45ms | 0% | Aprovado |
| messageRest | spike | 500 | 38.778 | 306.32/s | 179.03ms | 0% | Aprovado |
| messageRest | stress | 600 | 121.683 | 362.53/s | 525.69ms | 0% | Aprovado |
| voting | load | 210 | 82.760 | 642.80/s | 31.05ms | 0.90%³ | Aprovado |
| voting | spike | 500 | 24.667 | 439.54/s | 956.86ms | 0% | Aprovado |
| voting | stress | 600 | 201.090 | 796.70/s | 404.09ms | 0% | Aprovado |
| message (WS) | concurrency | 100 | — (STOMP) | 7.700 msg env | lat. p(95) 101ms | 0% | Aprovado |
| message (WS) | load | 160 | — (STOMP) | 7.400 env / 74.888 recv | lat. p(95) 128ms | 0% | Aprovado |
| message (WS) | spike | 150 | — (STOMP) | 12.810 env / 350.741 recv | lat. p(95) 14ms | 0% | Aprovado |
| message (WS) | stress | 250 | — (STOMP) | 15.145 env / 294.410 recv | lat. p(95) 32ms | 0% | Aprovado |

¹ Conflitos de convite (negócio) sob alta concorrência — dentro do threshold < 30%.  
² Race condition em `JoinRequest` sob contenção extrema (600 VUs, recurso compartilhado) — dentro do threshold < 40%. O design do teste foi corrigido (1 comunidade por VU); no redesign, 0% de falhas. A race condition no código persiste (ausência de `@Version` em `JoinRequest`).  
³ Chamadas `close voting` retornam 4xx sob concorrência no cenário `manage` — comportamento correto do backend, dentro do threshold < 1%.

**Load**

<img src="../evidencias/load/DomainCommunity-community-load.png" width="700">
<img src="../evidencias/load/DomainCommunity-community-invites-load.png" width="700">
<img src="../evidencias/load/DomainCommunity-community-join-requests-load.png" width="700">
<img src="../evidencias/load/DomainCommunity-messageRest-load.png" width="700">
<img src="../evidencias/load/DomainCommunity-message-load.png" width="700">
<img src="../evidencias/load/DomainCommunity-voting-load.png" width="700">
<img src="../evidencias/load/DomainCommunity-admin-load.png" width="700">

**Spike**

<img src="../evidencias/spike/DomainCommunity-community-spike.png" width="700">
<img src="../evidencias/spike/DomainCommunity-messageRest-spike.png" width="700">
<img src="../evidencias/spike/DomainCommunity-message-spike.png" width="700">
<img src="../evidencias/spike/DomainCommunity-voting-spike.png" width="700">
<img src="../evidencias/spike/DomainCommunity-admin-spike.png" width="700">

**Stress**

<img src="../evidencias/stress/DomainCommunity-community-stress.png" width="700">
<img src="../evidencias/stress/DomainCommunity-invites-stress.png" width="700">
<img src="../evidencias/stress/DomainCommunity-join-stress.png" width="700">
<img src="../evidencias/stress/DomainCommunity-messageRest-stress.png" width="700">
<img src="../evidencias/stress/DomainCommunity-message-concurrency-stress.png" width="700">
<img src="../evidencias/stress/DomainCommunity-message-stress.png" width="700">
<img src="../evidencias/stress/DomainCommunity-voting-stress.png" width="700">
<img src="../evidencias/stress/DomainCommunity-admin-stress.png" width="700">

---

### 3.5 DomainRecommendation — Motor de recomendação e roll-dice

> Relatório detalhado: [`../DomainRecommendation/RELATORIO-DOMAINRECOMMENDATION.md`](../DomainRecommendation/RELATORIO-DOMAINRECOMMENDATION.md)

| Subdomínio | Teste | VUs máx | Requests | Throughput | p(95) | Falhas | Status |
|------------|-------|---------|----------|-----------|-------|--------|--------|
| recommendation | load | 500 | 148.326 | ~940/s | 772.98ms¹ | 0% | Aprovado |
| recommendation | spike | 600 | 111.186 | 786.60/s | 2.11s | 0% | Aprovado |
| recommendation | stress | 400 | ~234.510 | ~718/s | 1.21s | 0% | Aprovado |
| roll-dice | load | 600 | 264.617 | 1.768/s | 31.4ms | 0% | Aprovado |
| roll-dice | spike | 600 | 60.174 | 756.32/s | 49.94ms | 0% | Aprovado |
| roll-dice | stress | 800 | ~175.087 | ~512/s | 420.03ms | 0% | Aprovado |

¹ Alto por design: cada iteração avalia 6 estratégias (because-you-read, favorite-genre, similar-authors, trending-in-communities, catalog-surprise, reread-worth-it), cada uma com joins no grafo social e histórico de leitura.

**Load**

<img src="../evidencias/load/DomainRecommendation-recommendation-load.png" width="700">
<img src="../evidencias/load/DomainRecommendation-roll-dice-load.png" width="700">

**Spike**

<img src="../evidencias/spike/DomainRecommendation-recommendation-spike.png" width="700">
<img src="../evidencias/spike/DomainRecommendation-roll-dice-spike.png" width="700">

**Stress**

<img src="../evidencias/stress/DomainRecommendation-recommendation-stress.png" width="700">
<img src="../evidencias/stress/DomainRecommendation-roll-dice-stress.png" width="700">

---

### 3.6 DomainShare — ShareCard (cartão compartilhável)

> Relatório detalhado: [`../DomainShare/RELATORIO-DOMAINSHARE.md`](../DomainShare/RELATORIO-DOMAINSHARE.md)

| Subdomínio | Teste | VUs máx | Requests | Throughput | p(95) | Falhas | Status |
|------------|-------|---------|----------|-----------|-------|--------|--------|
| shareCard | load | 150 | 17.159 | 113.32/s | 118.01ms | 0% | Aprovado |
| shareCard | spike | 500 | 27.787 | 373.38/s | 29.21ms | 0% | Aprovado |
| shareCard | stress | 600 | ~98.386 | ~299.6/s | 57.42ms | 0% | Aprovado |

> A primeira requisição de cada usuário executa o render real (Java2D/`BufferedImage`); as seguintes são cache hit no Redis (TTL 1h). O stress moveu **3.9 GB** de imagens PNG com p(95) de 57ms — o cache cumpre seu papel.

**Load**

<img src="../evidencias/load/DomainShare-shareCard-load.png" width="700">

**Spike**

<img src="../evidencias/spike/DomainShare-shareCard-spike.png" width="700">

**Stress**

<img src="../evidencias/stress/DomainShare-shareCard-stress.png" width="700">

---

### 3.7 DomainTrending — Rankings em alta

> Relatório detalhado: [`../DomainTrending/RELATORIO-DOMAINTRENDING.md`](../DomainTrending/RELATORIO-DOMAINTRENDING.md)

| Subdomínio | Teste | VUs máx | Requests | Throughput | p(95) | Falhas | Status |
|------------|-------|---------|----------|-----------|-------|--------|--------|
| trending | load | 210 | 51.279 | 341.08/s | 31.3ms | 0% | Aprovado |
| trending | spike | 500 | 32.271 | 274.52/s | 16.51ms | 0% | Aprovado |
| trending | stress | 600 | ~102.8k | ~300/s | ~23.8ms | 0.00% (7) | Aprovado |

> p(95) ≤ 32ms em todos os três tipos — melhor estabilidade de latência da suíte, graças à materialização/cache dos rankings via Redis.

**Load**

<img src="../evidencias/load/DomainTrending-trending-load.png" width="700">

**Spike**

<img src="../evidencias/spike/DomainTrending-trending-spike.png" width="700">

**Stress**

<img src="../evidencias/stress/DomainTrending-trending-stress.png" width="700">

---

### 3.8 DomainDna — DNA literário

> Relatório detalhado: [`../DomainDna/RELATORIO-DOMAINDNA.md`](../DomainDna/RELATORIO-DOMAINDNA.md)

| Subdomínio | Teste | VUs máx | Requests | Throughput | p(95) | Falhas | Status |
|------------|-------|---------|----------|-----------|-------|--------|--------|
| dna | load | 80 | 12.381 | 92.87/s | 45.21ms | 0% | Aprovado |
| dna | spike | 300 | 19.172 | 175.84/s | 58.63ms | 0% | Aprovado |
| dna | stress | 500 | 44.899 | 150.27/s | 29.88ms | 0% | Aprovado |

> Apesar de percorrer todo o histórico de leitura do usuário, o cálculo é eficiente: p(95) ≤ 58ms em todos os cenários e 0% de falhas.

**Load**

<img src="../evidencias/load/DomainDna-dna-load.png" width="700">

**Spike**

<img src="../evidencias/spike/DomainDna-dna-spike.png" width="700">

**Stress**

<img src="../evidencias/stress/DomainDna-dna-stress.png" width="700">

---

## 4. Destaques

| Categoria | Vencedor | Número |
|-----------|----------|--------|
| Maior throughput (load) | roll-dice-load | 1.768 req/s · 600 VUs · p(95) 31ms |
| Maior throughput (stress) | user-stress | 833.75 req/s · 600 VUs |
| Maior throughput sob payload rico | recommendation-load | ~940 req/s · 500 VUs · 6 estratégias/req |
| Melhor throughput de leitura social | social-load | 672.18 req/s · p(95) 27ms |
| Menor latência p(95) (load) | community-load | 15.88ms · 90 VUs |
| Menor latência p(95) (spike) | user-spike | 15.46ms · 500 VUs |
| Melhor estabilidade de latência | trending | p(95) ≤ 32ms nos 3 tipos de teste |
| Maior volume de dados | shareCard-stress | 3.9 GB de imagens PNG |
| Entrega WS mais rápida | message-spike | latência p(95) 14ms · 150 VUs |
| Endpoint mais pesado (aceito) | recommendation | p(95) 772ms (6 estratégias/req) |

---
