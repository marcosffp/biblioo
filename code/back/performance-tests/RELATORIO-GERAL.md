# Relatório Geral de Performance — Biblioo Backend

> **Data de referência:** 2026-05-28  
> **Ferramenta:** k6 (Grafana)  
> **Ambiente:** localhost:8080  
> **Total de domains:** 8 (DomainBook, DomainCommunity, DomainDna, DomainFeed, DomainRecommendation, DomainShare, DomainTrending, DomainUser)

---

## Status por Domain

| Domain | Subdomínios | Testes executados | Testes pendentes | Status geral |
|--------|-------------|-------------------|------------------|--------------|
| DomainBook | book, collection, shelf, shelfItem | 12/12 | 0 | ✅ Completo |
| DomainCommunity | community, invites, join-requests, manage, message, messageRest, voting | 7/17 | 10 | ⚠️ Parcial |
| DomainDna | dna | 0/3 | 3 | ❌ Pendente |
| DomainFeed | comment, commentInteraction, feed, post, review | 0/15 | 15 | ❌ Pendente |
| DomainRecommendation | recommendation, roll-dice | 0/6 | 6 | ❌ Pendente |
| DomainShare | shareCard | 0/3 | 3 | ❌ Pendente |
| DomainTrending | trending | 0/3 | 3 | ❌ Pendente |
| DomainUser | user | 0/3 | 3 | ❌ Pendente |

**Progresso geral:** 19 de 62 testes executados (31%)

---

## Resultados dos Testes Executados

### DomainBook — 12/12 testes ✅

| Subdomínio | Teste | VUs máx | p(95) | Falhas | Resultado |
|------------|-------|---------|-------|--------|-----------|
| book | load | 100 | 32.51ms | 0% | ✅ |
| book | spike | 300 | 8.42ms | 0% | ✅ |
| book | stress | 400 | 18.6ms | 0% | ✅ |
| collection | load | 210 | 22.29ms | 0% | ✅ |
| collection | spike | 500 | 241.76ms | 0% | ✅ |
| collection | stress | 600 | 309.26ms | 0% | ✅ |
| shelf | load | 210 | 44.66ms | 0% | ✅ |
| shelf | spike | 500 | 76.67ms | 0% | ✅ |
| shelf | stress | 600 | 138.75ms | 0% | ✅ |
| shelfItem | load | 210 | 27.75ms | 0% | ✅ |
| shelfItem | spike | 500 | 238.08ms | 0% | ✅ |
| shelfItem | stress | 600 | 337.32ms | 0% | ✅ |

### DomainCommunity — 7/17 testes ⚠️

| Subdomínio | Teste | VUs máx | p(95) | Falhas HTTP | Resultado |
|------------|-------|---------|-------|-------------|-----------|
| community | load | 90 | 15.43ms | 0% | ✅ |
| community | spike | 200 | 13.9ms | 0% | ✅ |
| community | stress | 500 | 47.95ms | 0% | ✅ |
| community-invites | load | 2 | 27.88ms | 0% | ✅ |
| community-invites | stress | 600 | 319.35ms | 8.06% | ⚠️ |
| community-join-requests | load | 210 | 121.11ms | **31.19%** | ❌ |
| community-join-requests | stress | 600 | 997.23ms | 19.19% | ⚠️ |

---

## Único Threshold Violado

**`community-join-requests-load.js`** — threshold `http_req_failed < 5%` violado com **31.19%** de falhas.

**Causa identificada:** Race condition no processamento de `JoinRequest`. Múltiplos VUs tentam rejeitar a mesma solicitação ao mesmo tempo, gerando `CommunityBusinessException` com mensagens:
- `"Esta solicitação já foi processada."`
- `"Já existe uma solicitação pendente."`

**Correção recomendada:** Aplicar lock otimista (`@Version`) ou pessimista (`@Lock(PESSIMISTIC_WRITE)`) na entidade `JoinRequest`.

---

## Performance Highlights

### Melhor latência p(95) observada
- **community stress:** 47.95ms com 500 VUs — throughput de 995.2 req/s
- **book spike:** 8.42ms com 300 VUs — endpoint de busca extremamente rápido
- **community spike:** 13.9ms com 200 VUs

### Maior throughput observado
- **community stress:** 995.2 req/s (500 VUs)
- **book spike:** 651.6 req/s (300 VUs)
- **shelf spike:** 716.6 req/s (500 VUs)

### Maior carga sustentada sem falhas
- **shelf stress:** 600 VUs, 4m, p(95)=138.75ms, 0 falhas
- **collection stress:** 600 VUs, ~4m40s, p(95)=309.26ms, 0 falhas
- **shelfItem stress:** 600 VUs, ~4m41s, p(95)=337.32ms, 0 falhas

### Maior volume de dados
- **book stress:** 1.2 GB recebidos em 3m30s (5.6 MB/s)
- **community stress:** 321 MB recebidos em 3m35s (1.5 MB/s)

---

## Avisos e Anomalias

| Teste | Aviso | Impacto |
|-------|-------|---------|
| collection-load, shelf-load, shelf-spike, shelf-stress, collection-stress, community-invites-stress | Séries temporais únicas acima de 100.000 (k6 WARN) | Alto uso de memória no k6 — não afeta produção |
| community-join-requests-load | 31.19% de falhas HTTP, threshold cruzado | **Bug real de concorrência** — requer correção |
| community-invites-stress | 8.06% de falhas — dentro do threshold de 30% | Erros de negócio esperados sob alta concorrência |
| community-join-requests-stress | 19.19% de falhas — dentro do threshold de 40% | Race condition sob alta carga |
| book-load (max 3.68s) | Latência máxima isolada bem acima do p(95) | Outlier pontual (GC pause ou cold start) |

---

## Resumo Executivo

**O que está aprovado:** O DomainBook está completamente validado — 12 de 12 testes passaram com zero falhas, inclusive sob 600 VUs simultâneos. Os endpoints de busca e leitura de livros, gerenciamento de estantes e itens são robustos e escaláveis.

**O que requer atenção imediata:** O fluxo de solicitações de entrada em comunidades privadas (`join-requests`) apresenta race condition sob carga concorrente — 31% das rejeições falham quando múltiplos moderadores tentam processar a mesma solicitação ao mesmo tempo. Esse bug precisa ser corrigido antes do lançamento de comunidades privadas.

**O que ainda falta testar:** 43 de 62 testes planejados ainda não foram executados, cobrindo DomainCommunity (message, voting), DomainDna, DomainFeed, DomainRecommendation, DomainShare, DomainTrending e DomainUser. Ver `TESTES-PENDENTES.md` para o plano completo.
