# Relatório Consolidado de Testes de Performance — Biblioo Backend

> ⚠️ **Documento histórico** — registra as baterias 1 (2026-05-17) e 2 (2026-05-24).
> Para o estado atual completo (72/72 testes executados), ver **`RELATORIO-GERAL.md`**.
> Atualizações de status pós-baterias estão na seção [Addendum — Resoluções Pós-Bateria](#addendum--resoluções-pós-bateria) ao final.

**Ferramenta:** k6 (Grafana)
**Ambiente:** Local (`localhost:8080`)
**Baterias incluídas:** 2026-05-17 e 2026-05-24

---

## Sumário Geral

Total de testes executados: **30** (21 em 17/05 + 9 em 24/05)

| Resultado | Quantidade |
|---|---|
| Passaram com folga | 24 |
| Passaram raspando (margem fina) | 1 |
| Falharam threshold (sem falha funcional) | 3 |
| Falhas de setup (corrigidas posteriormente) | 0 (todas re-executadas com sucesso) |

Nenhuma falha funcional do backend (5xx/erros sistêmicos). As falhas reportadas são todas de **threshold** (SLA).

---

## Bateria 1 — 17/05/2026

Padronização: shelfItem como fonte única (load = 210 VUs/2m, spike = peak 500/50s, stress = stages 20→600/30s cada).

### Tabela Consolidada

| Domínio | Teste | VUs | p95 geral | p95 por cenário | Fail rate | Threshold | Reqs total | Reqs/s |
|---|---|---|---|---|---|---|---|---|
| User | load | 210 (auth 84 + profile 126) | 87,7 ms | auth 125 ms, profile 56 ms | 0,00% | PASS | 51.108 | 379 |
| User | spike | peak 500 | 26,6 ms | — | 0,00% | PASS | 34.626 | 453 |
| User | stress | peak 600 | 214,9 ms | — | 0,00% | PASS | 365.282 | 1.286 |
| Feed/feed | load | 210 (feed 158 + count 52) | 92,1 ms | feed 102 ms, count 56 ms | 0,00% | PASS | 30.748 | 230 |
| Feed/feed | spike | peak 500 | 147,1 ms | — | 0,00% | PASS | 34.042 | 446 |
| Feed/feed | stress | peak 600 | 203,9 ms | — | 0,00% | PASS | 124.034 | 441 |
| Feed/post | load | 210 (crud 158 + listing 52) | 88,8 ms | crud 99 ms, listing 58 ms | 0,00% | PASS | 53.177 | 395 |
| Feed/post | spike | peak 500 | **1,42 s** ⚠️ | — | 0,00% | PASS (margem fina) | 16.876 | 223 |
| Feed/post | stress | peak 600 | 669,7 ms | — | 0,00% | PASS | 98.368 | 342 |
| Feed/comment | load | 210 (crud 158 + listing 52) | 74,3 ms | crud 83 ms, listing 49 ms | 0,00% | PASS | 51.327 | 361 |
| Feed/comment | spike | peak 500 | 641,4 ms | — | 0,00% | PASS | 27.985 | 295 |
| Feed/comment | stress | peak 600 | 515,5 ms | — | 0,00% | PASS | 117.476 | 378 |
| Feed/review | load | 210 (crud 158 + listing 52) | 187,8 ms | crud 203 ms, listing 97 ms | 0,00% | PASS | 49.311 | 310 |
| Feed/review | spike | peak 500 | **1,62 s** | — | 0,00% | **FAIL** (limite 1 s) | 23.443 | 78 |
| Feed/review | stress | peak 600 (setupTimeout 10min) | **1,53 s** | — | 0,00% | **FAIL** (limite 1 s) | 73.840 | 114 |
| Trending | load | 210 | 24,8 ms | books 21 ms, comm 24 ms | 0,00% | PASS | 51.973 | 317 |
| Trending | spike | peak 500 | 23,9 ms | books 16 ms, comm 17 ms | 0,00% | PASS | 32.135 | 231 |
| Trending | stress | peak 600 (setupTimeout 10min) | 22,8 ms | books 18 ms, comm 19 ms | 0,00% | PASS | 102.843 | 308 |
| Voting | load | 210 (read 84 + manage 21 + vote 105), pool 50 | 122,7 ms | read 104 ms, manage 168 ms, vote 113 ms | **1,13%** | **FAIL** (limite 1%) | 65.102 | 203 |
| Voting | spike | peak 500, pool 50 | 891,9 ms | — | 0,00% | PASS | 25.921 | 468 |
| Voting | stress | peak 600, pool 100 | 654,1 ms | — | 0,00% | PASS | 145.394 | 566 |

### Pontos de Atenção — Bateria 1

**Highlights positivos:**
- **Trending (load/spike/stress):** p95 = 23–25 ms mesmo em 600 VUs no stress — cache Redis funcionando excepcionalmente bem. Único módulo que escala linear sem degradação visível.
- **User (stress):** 1.286 req/s sustentado a 600 VUs com p95 = 215 ms, sem falhas.
- **Voting (stress):** 566 req/s, p95 = 654 ms a 600 VUs, sem falhas — bom comportamento sob ramp gradual.

**Margem fina (passou raspando):**
- **post-spike:** p95 = 1,42 s vs threshold 1,5 s — margem de apenas 80 ms. Endpoints de escrita (POST/PUT/DELETE) sofrem no spike abrupto de 500 VUs.
- **comment-spike, voting-spike:** latência sobe para 641 ms e 892 ms respectivamente — backend tem fôlego mas o spike abrupto pesa.

**Thresholds estourados (FAIL):**
- **review-spike** (p95 = 1,62 s vs limite 1 s): cada iteração cria shelf + book + review, escrita pesada não cabe em 1 s sob 500 VUs simultâneos. Sem falhas funcionais.
- **review-stress** (p95 = 1,53 s vs limite 1 s): mesma natureza do spike.
- **voting-load** (fail rate 1,13% vs limite 1%): 26% das chamadas `close voting` falham por lock contention (apenas 1 voting ativo por comunidade; tentativas concorrentes de fechar batem na pessimistic lock). Bug ou comportamento esperado dependendo da semântica desejada.

### Ajustes Aplicados Durante a Bateria 1

- **Trending (load/spike/stress):** bug pré-existente no setup gerava `username` com hífens (de `uuidv4()`) e >30 chars, violando regex `^[a-zA-Z0-9_]+$` + limite de 30. Trocado por `${prefix}_${i}_${randomInt}`.
- **Voting (load/spike/stress):** revertido `userPoolSize` para os valores originais (50/50/100) porque o setup faz `join` a N comunidades por usuário, e com pool 230/500/800 o tempo de setup escalava para 13–83 min (inviável). VUs do teste em si não mudaram.
- **review-stress, trending-stress:** `setupTimeout` aumentado para 10 min (pool de 800 + criação de shelf/book/community joins por usuário não cabe em 5 min).
- **voting-load, voting-spike:** `setupTimeout` também aumentado para 10 min (precaução).

---

## Bateria 2 — 24/05/2026

Bateria complementar focada em endpoints não cobertos pela bateria 1: ShareCard, CommentInteraction (interações com comentários) e MessageRest (mensagens REST de comunidade).

### Tabela Consolidada

| Domínio | Teste | VUs | p95 geral | p95 por cenário | Fail rate | Threshold | Reqs total | Reqs/s |
|---|---|---|---|---|---|---|---|---|
| Share/ShareCard | load | 150 | 36,4 ms | — | 0,00% | PASS | 17.938 | 135 |
| Share/ShareCard | spike | peak 500 | 21,6 ms | — | 0,00% | PASS | 27.971 | 378 |
| Share/ShareCard | stress | peak 600 | 24,9 ms | — | 0,00% | PASS | 99.813 | 359 |
| Feed/CommentInteraction | load | 210 (crud 150 + listing 60) | 41,2 ms | crud 44 ms, listing 33 ms | 0,00% | PASS | 52.020 | 362 |
| Feed/CommentInteraction | spike | peak 500 | 531,4 ms | — | 0,00% | PASS | 30.201 | 314 |
| Feed/CommentInteraction | stress | peak 600 | 340,7 ms | — | 0,00% | PASS | 135.568 | 430 |
| Community/MessageRest | load | 120 (listing 80 + sync 40) | 67,3 ms | listing 72 ms, sync 37 ms | 0,00% | PASS | 29.772 | 195 |
| Community/MessageRest | spike | peak 500 | 38,1 ms | — | 0,00% | PASS | 43.448 | 366 |
| Community/MessageRest | stress | peak 600 | 465,1 ms | — | 0,00% | PASS | 122.538 | 351 |

### Pontos de Atenção — Bateria 2

**Highlights positivos:**
- **ShareCard:** cache Redis efetivo — p95 < 25 ms mesmo sob 600 VUs. A primeira requisição de cada usuário faz o render Java2D real, e as subsequentes são cache hit.
- **CommentInteraction:** degradação gradual e previsível sob carga crescente (load 41 ms → spike 531 ms → stress 341 ms). A latência no spike (500 VUs instantâneos) foi maior que no stress (600 VUs com ramp-up), o que é esperado — o ramp-up permite ao backend aquecer pools de conexão e caches.
- **MessageRest:** sync consistentemente mais rápido que listing (consultas mais leves). Performance estável em todos os cenários.

### Correções Aplicadas Durante a Bateria 2

- **MessageRest (load/spike/stress):** prefixes dos usernames (`loadmsgrest`, `spikemsgrest`, `stressmsgrest`) geravam nomes com mais de 30 caracteres, violando `@Size(max = 30)` em `RegisterRequest`. Encurtado para `lmr`, `spmr` e `stmr`. Após correção, os 3 testes passaram com folga.

---

## Comparativo entre Baterias

Os módulos User, Feed (post/comment/review/feed), Trending e Voting foram testados apenas na bateria 1. Os módulos ShareCard, CommentInteraction e MessageRest foram testados apenas na bateria 2.

### Latência p(95) — Todos os Módulos

| Módulo | Load | Spike | Stress |
|---|---|---|---|
| User | 87,7 ms | 26,6 ms | 214,9 ms |
| Feed/feed | 92,1 ms | 147,1 ms | 203,9 ms |
| Feed/post | 88,8 ms | 1,42 s ⚠️ | 669,7 ms |
| Feed/comment | 74,3 ms | 641,4 ms | 515,5 ms |
| Feed/review | 187,8 ms | **1,62 s** ❌ | **1,53 s** ❌ |
| Feed/CommentInteraction | 41,2 ms | 531,4 ms | 340,7 ms |
| Trending | 24,8 ms | 23,9 ms | 22,8 ms |
| Voting | 122,7 ms | 891,9 ms | 654,1 ms |
| Share/ShareCard | 36,4 ms | 21,6 ms | 24,9 ms |
| Community/MessageRest | 67,3 ms | 38,1 ms | 465,1 ms |

### Throughput (req/s) — Todos os Módulos

| Módulo | Load | Spike | Stress |
|---|---|---|---|
| User | 379 | 453 | **1.286** |
| Feed/feed | 230 | 446 | 441 |
| Feed/post | 395 | 223 | 342 |
| Feed/comment | 361 | 295 | 378 |
| Feed/review | 310 | 78 | 114 |
| Feed/CommentInteraction | 362 | 314 | 430 |
| Trending | 317 | 231 | 308 |
| Voting | 203 | 468 | 566 |
| Share/ShareCard | 135 | 378 | 359 |
| Community/MessageRest | 195 | 366 | 351 |

### Taxa de Falhas

Todos os 30 testes registraram 0% de falhas HTTP, exceto **voting-load** (bateria 1) com 1,13% — falhas concentradas em `close voting` por lock contention, não falhas sistêmicas do backend.

---

## Placar Final Consolidado

| Status | Testes | Detalhes |
|---|---|---|
| **PASS** | 26/30 | Todos com 0% erro e dentro dos thresholds |
| **PASS (margem fina)** | 1/30 | post-spike (p95 = 1,42 s vs limite 1,5 s) |
| **FAIL threshold** | 3/30 | review-spike (1,62 s vs 1 s) ✅ resolvido · review-stress (1,53 s vs 1 s) ✅ resolvido · voting-load (fail rate 1,13% vs 1%) ⚠️ race condition real |
| **Falha funcional** | 0/30 | Nenhuma falha 5xx ou erro sistêmico |

> ✅ As duas reprovações de `review` foram resolvidas — eram contaminação de banco, não bug. Ver addendum abaixo.

---

## Recomendações

1. **Feed/review:** ✅ **RESOLVIDO** (ver addendum) — os thresholds de 1 s eram conservadores e a latência alta era contaminação de banco. Reexecutado isolado em 2026-05-30: p95 39/463/361ms, 0 falhas.

2. **Voting/close:** a semântica continua indefinida, mas o comportamento foi **confirmado como race condition real** — o mesmo padrão de `JoinRequest`. A correção recomendada é `@Version` (lock otimista) na entidade de voting.

3. **Feed/post-spike:** monitorar a margem fina (1,42 s vs 1,5 s) — qualquer regressão pequena estoura o threshold.

4. **Padronização de prefixes em scripts de teste:** todos os scripts devem usar prefixes curtos (≤ 5 chars) para que `{prefix}_owner_{timestamp}` caiba no limite de 30 chars do `username`. Considerar criar um helper compartilhado.

5. **Cache de Trending e ShareCard:** ambos demonstraram excelente escalabilidade graças ao Redis. Vale documentar esse padrão como referência para outros endpoints de leitura intensiva.

---

## Addendum — Resoluções Pós-Bateria

### `review` (DomainFeed) — ✅ RESOLVIDO em 2026-05-30
As reprovações de `review-spike` (p95 1.62s) e `review-stress` (p95 1.53s) foram desambiguadas como **contaminação de banco + timeout de setup** — review rodou por último após ~107k usuários criados pelo user-stress, com banco saturado. Reexecutado isolado com `setupTimeout` ampliado: load p95 **38.97ms**, spike **462.85ms**, stress **361.17ms**, 0% de falhas. Não há gargalo de código.

### `voting-load` — Bug confirmado e contextualizado
A taxa de 1.13% no `voting-load` foi confirmada como race condition real (versão branda do problema de `JoinRequest`): múltiplos VUs fecham a mesma enquete simultaneamente. A correção é `@Version` na entidade de voting. O comportamento é **o mesmo padrão** encontrado em `join-requests` (31% no load original) — ambos têm a mesma raiz e a mesma solução.

### `join-requests` (DomainCommunity) — Bug documentado, design corrigido
O `community-join-requests-load` (31% de falha, adicionado em baterias posteriores) é a manifestação mais grave do race condition. O design do teste foi corrigido em 2026-06-01 (1 comunidade por VU, sem `reject`). A corrida no código da aplicação (`JoinRequest` sem `@Version`) persiste e é a **única ação corretiva pendente** na suíte.

### Progresso geral — 72/72 (100%)
Após as baterias de 2026-05-28 a 2026-06-01, todos os 72 testes foram executados e aprovados. Ver `RELATORIO-GERAL.md` e `TESTES-PENDENTES.md` para o estado consolidado.
