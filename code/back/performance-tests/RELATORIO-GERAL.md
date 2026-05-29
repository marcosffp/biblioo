# Relatório Geral de Performance — Biblioo Backend

> **Data de referência:** 2026-05-28
> **Ferramenta:** k6 (Grafana) v1.7.1
> **Ambiente:** localhost:8080
> **Total de domains:** 8 (DomainBook, DomainCommunity, DomainDna, DomainFeed, DomainRecommendation, DomainShare, DomainTrending, DomainUser)
>
> ⚠️ **Nota de comparabilidade:** a bateria DomainBook/Community original (`domainbook.md`) foi capturada em outra máquina (`marcos@MacBook-Air`). As 31 execuções de 2026-05-28 desta atualização rodaram em máquina distinta, contra um banco com estado acumulado de execuções anteriores. A comparação de **configuração de carga** entre os testes é válida; os números de **latência absoluta** não são estritamente comparáveis entre máquinas.

---

## Status por Domain

| Domain | Subdomínios | Testes executados | Testes pendentes | Status geral |
|--------|-------------|-------------------|------------------|--------------|
| DomainBook | book, collection, shelf, shelfItem | 12/12 | 0 | ✅ Completo |
| DomainCommunity | community, invites, join-requests, manage, messageRest, voting, message | 14/17 | 3 (message/WebSocket) | ⚠️ Parcial — 1 bug |
| DomainDna | dna | 0/3 | 3 | ❌ Pendente |
| DomainFeed | feed, post, comment, commentInteraction, review | 15/15 | 0 | ⚠️ review reprovado |
| DomainRecommendation | recommendation, roll-dice | 0/6 | 6 | ❌ Pendente |
| DomainShare | shareCard | 3/3 | 0 | ✅ Completo |
| DomainTrending | trending | 3/3 | 0 | ✅ Completo |
| DomainUser | user | 3/3 | 0 | ✅ Completo |

**Progresso geral:** **50 de 62 testes executados (81%)**.
**Pendentes (12):** DomainDna (3), DomainRecommendation (6) — carga deliberadamente mais leve; DomainCommunity `message` (3) — WebSocket/STOMP, sessão dedicada.

---

## Resultados desta Bateria (31 testes — 2026-05-28)

| Domain | Subdomínio | Teste | VUs máx | Requests | Throughput | p(95) | Falhas | Resultado |
|--------|-----------|-------|---------|----------|-----------|-------|--------|-----------|
| User | user | load | 210 | 51.880 | 389.96/s | 58.77ms | 0% | ✅ |
| User | user | spike | 500 | 34.842 | 464.37/s | 16.45ms | 0% | ✅ |
| User | user | stress | 600 | 427.830 | **1538.35/s** | 147ms | 0% | ✅ |
| Share | shareCard | load | 150 | 17.940 | 135.24/s | 39.77ms | 0% | ✅ |
| Share | shareCard | spike | 500 | 27.807 | 374.88/s | 27.36ms | 0% | ✅ |
| Share | shareCard | stress | 600 | 98.923 | 354.81/s | 35.36ms | 0% | ✅ |
| Trending | trending | load | 210 | 51.029 | 340.70/s | 37.62ms | 0% | ✅ |
| Trending | trending | spike | 500 | 32.227 | 285.26/s | 17.4ms | 0% | ✅ |
| Trending | trending | stress | 600 | 102.437 | 338.90/s | 25.57ms | 0.00% (7) | ✅ |
| Community | manage | stress | 200 | 106.973 | 497.33/s | 29.55ms | 0% | ✅ |
| Community | messageRest | load | 120 | 28.932 | 190.60/s | 98.5ms | 0% | ✅ |
| Community | messageRest | spike | 500 | 43.674 | 373.00/s | 27.59ms | 0% | ✅ |
| Community | messageRest | stress | 600 | 121.497 | 350.25/s | 462.79ms | 0% | ✅ |
| Community | voting | load | 210 | 83.011 | 639.53/s | 24.93ms | 0.92% | ✅ |
| Community | voting | spike | 500 | 33.559 | 610.79/s | 521.32ms | 0% | ✅ |
| Community | voting | stress | 600 | 197.598 | 778.18/s | 399.99ms | 0% | ✅ |
| Feed | feed | load | 210 | 30.671 | 231.59/s | 61.87ms | 0% | ✅ |
| Feed | feed | spike | 500 | 34.830 | 462.59/s | 130.34ms | 0% | ✅ |
| Feed | feed | stress | 600 | 133.148 | 476.22/s | 111.99ms | 0% | ✅ |
| Feed | post | load | 210 | 54.535 | 409.62/s | 30.71ms | 0% | ✅ |
| Feed | post | spike | 500 | 33.046 | 441.87/s | 352.1ms | 0% | ✅ |
| Feed | post | stress | 600 | 142.484 | 510.54/s | 268.21ms | 0% | ✅ |
| Feed | comment | load | 210 | 52.055 | 370.20/s | 31.93ms | 0% | ✅ |
| Feed | comment | spike | 500 | 33.718 | 372.79/s | 417.12ms | 0% | ✅ |
| Feed | comment | stress | 600 | 142.316 | 464.82/s | 291.99ms | 0% | ✅ |
| Feed | commentInteraction | load | 210 | 52.021 | 363.72/s | 36.42ms | 0% | ✅ |
| Feed | commentInteraction | spike | 500 | 29.814 | 313.42/s | 540.53ms | 0% | ✅ |
| Feed | commentInteraction | stress | 600 | 133.860 | 426.36/s | 353.67ms | 0% | ✅ |
| Feed | review | load | 210 | 33.354 | 199.01/s | **3.5s** | 0% | ❌ |
| Feed | review | spike | 500 | — | — | (setup timeout 300s) | — | ⚠️ |
| Feed | review | stress | 600 | — | — | **1.13s** (setup timeout 600s) | — | ❌ |

**28 de 31 aprovados.** As 3 reprovações são todas no subdomínio **review** do DomainFeed.

---

## Resultados das Baterias Anteriores

### DomainBook — 12/12 ✅ (todos passaram, 0% de falhas)
book, collection, shelf, shelfItem — load/spike/stress. Melhor p(95): book-spike 8.42ms (300 VUs). Ver `DomainBook/RELATORIO-DOMAINBOOK.md`.

### DomainCommunity — community/invites/join-requests (7 testes anteriores)
- community load/spike/stress: ✅ 0% (stress 995 req/s).
- community-invites load ✅ / stress ⚠️ 8.06% (conflitos de negócio, threshold 30%).
- community-join-requests load ❌ **31.19%** / stress ⚠️ 19.19%. Ver bug abaixo.

---

## Thresholds Violados (3 testes)

### 1. `community-join-requests-load.js` — `http_req_failed` 31.19% (limite 5%) ❌
**Causa:** race condition no processamento de `JoinRequest`. Múltiplos VUs rejeitam a mesma solicitação simultaneamente → `CommunityBusinessException` ("Esta solicitação já foi processada." / "Já existe uma solicitação pendente.").
**Correção:** lock otimista (`@Version`) ou pessimista (`@Lock(PESSIMISTIC_WRITE)`) na entidade `JoinRequest`.

### 2. `review-load.js` — `http_req_duration` p(95)=3.5s (limite 1000ms) ❌
**Causa:** latência com cauda longa severa — mediana 19ms mas p(95) 3.5s e **max 13.19s**, com 0% de falha HTTP (status correto).
**⚠️ Confundidor importante:** review rodou **por último** na bateria, contra o **estado de banco mais saturado de toda a sessão** (após o user-stress registrar ~107k usuários e os stress de post/comment/commentInteraction inflarem o banco). Os dados atuais **não conseguem separar** "endpoint de review é intrinsecamente lento" de "o banco estava inchado pelo que rodou antes".
**Hipótese (a confirmar):** o padrão mediana baixa + p(95)/max altíssimos é *consistente* com **query sem índice / N+1** na listagem/agregação de reviews — degradação que piora com tabelas grandes. Mas é hipótese, não conclusão.
**Ação:** **rerodar os 3 testes de review isoladamente e cedo** (banco limpo) para desambiguar. Se a lentidão persistir, então investigar índices nas FKs / campos de ordenação e mover cálculos de média/contagem para query agregada ou coluna materializada.

### 3. `review-stress.js` — `setup()` timeout (600s) + p(95)=1.13s ❌
**Causa:** a fase de setup (criação em massa de reviews) não concluiu em 600s — confirma que **criar/listar reviews é lento**. `review-spike` (⚠️) teve o mesmo timeout de setup (300s), rodando de forma não-representativa (apenas 869 req).
**Ação:** corrigir a performance de reviews (item 2) e rerodar os 3 testes do subdomínio.

---

## Falhas dentro do Threshold (aceitas, mas reais)

| Teste | Taxa | Threshold | Natureza |
|-------|------|-----------|----------|
| community-invites stress | 8.06% | < 30% | Conflitos de convite (negócio) sob alta concorrência |
| community-join-requests stress | 19.19% | < 40% | Mesma race condition do load (escalada com VUs) |
| **voting load** | **0.92%** | < 1% | **Mesma race condition, versão branda:** fechar a mesma enquete concorrentemente (check `close voting` falhou 22%) |
| trending stress | 0.00% (7 req) | < 5% | Falha transitória de setup (owner register) |

> **Padrão recorrente:** race condition em entidades de community que mudam de estado (`JoinRequest`, fechamento de `Voting`). Mesma raiz, mesma correção (`@Version`). Recomenda-se auditar invites, join-requests e votings.

---

## Performance Highlights

### Maior throughput observado
- **user stress: 1538.35 req/s** (600 VUs, p95 147ms) — **novo recorde da suíte**, supera community-stress.
- community stress: 995.2 req/s (500 VUs).
- voting stress: 778.18 req/s (600 VUs).
- post stress: 510.54 req/s · feed stress: 476.22 req/s.

### Melhor latência p(95)
- book spike: 8.42ms (300 VUs).
- user spike: 16.45ms (500 VUs) · trending spike: 17.4ms (500 VUs).

### Maior volume de dados
- **shareCard stress: 3.9 GB** recebidos (imagens PNG) — novo recorde, supera book-stress (1.2 GB).
- messageRest stress: 1.3 GB · shareCard spike: 1.1 GB.

### Maior carga sustentada sem falhas
- user stress: 600 VUs, 1538 req/s, p95 147ms, 0 falhas.
- voting stress: 600 VUs, 778 req/s, 0 falhas.
- feed/post/comment/commentInteraction stress: 600 VUs cada, 0 falhas.

---

## Avisos e Anomalias

| Teste | Aviso | Impacto |
|-------|-------|---------|
| review-load | p(95) 3.5s, max 13.19s | **Gargalo real** — query lenta sob carga |
| review-spike / review-stress | `setup() execution timed out` | Setup (criação de reviews) lento demais — testes não representativos |
| community-join-requests-load | 31.19% falhas | **Bug real de concorrência** |
| voting-load | check `close voting` 22% falho | Race condition branda (mesma classe do join-requests) |
| collection/shelf/invites stress (baterias anteriores) | >100k séries temporais (k6 WARN) | Alto uso de memória no k6 — não afeta produção |

---

## Resumo Executivo

**O que está aprovado (44 testes ✅):** DomainBook (12/12), DomainUser (3/3), DomainShare (3/3), DomainTrending (3/3), o núcleo social do DomainFeed (feed, post, comment, commentInteraction — 12/12), o DomainCommunity aprovado (community load/spike/stress + invites-load = 4 anteriores, mais manage + messageRest×3 + voting×3 = 7 desta bateria = 11). Destaque para o **DomainUser**, que sustentou **1538 req/s com 600 VUs e 0% de falhas** — a melhor escalabilidade da suíte. Autenticação, perfil, feed social, trending, geração de cards e leitura de mensagens são robustos e escaláveis.

**O que requer atenção imediata (2 bugs):**
1. **`review` (DomainFeed)** — endpoint lento: p(95) de 3.5s no load e setup que estoura timeout no spike/stress. Provável query sem índice / N+1. **Bloqueia a validação do subdomínio de resenhas.**
2. **`join-requests` (DomainCommunity)** — race condition já conhecida (31% de falhas). A mesma classe de problema apareceu de forma branda no fechamento de enquetes (`voting`, 0.92%). Correção: lock otimista em todas as entidades de estado de community.

**O que ainda falta testar (12 testes):** DomainDna (3) e DomainRecommendation (6) — carga deliberadamente mais leve, coerente com endpoints custosos; DomainCommunity `message` (3 + concurrency) — WebSocket/STOMP, requer sessão dedicada com setup específico. Ver `TESTES-PENDENTES.md` e `COMPARACAO-CARGA.md`.