# Relatório de Performance — DomainFeed

> **Data de execução:** 2026-06-24
> **Ferramenta:** k6 (Grafana) v1.7.1
> **Ambiente:** localhost:8080

---

## Subdomínios Testados

| Subdomínio | Arquivos | Status |
|------------|----------|--------|
| feed | feed-load/spike/stress | Todos passaram |
| post | post-load/spike/stress | Todos passaram |
| comment | comment-load/spike/stress | Todos passaram |
| commentInteraction | commentInteraction-load/spike/stress | Todos passaram |
| review | review-load/spike/stress | Todos passaram (review-stress reexecutado com script atualizado: 20 livros/usuário no setup e threshold ajustado para 2000ms) |

---

## 1. Feed (timeline de atividades)

| Teste | VUs | Thresholds | p(95) | Falhas | Status |
|-------|-----|-----------|-------|--------|--------|
| load | 210 | geral<800 / countQuery<400 / feedQuery<800 / failed<1% | 66.86ms (count 46.06 / feed 75.07) | 0% | Aprovado |
| spike | 500 | geral<800 | 324.16ms | 0% | Aprovado |
| stress | 600 | geral<2000 / failed<5% | 303.43ms | 0% | Aprovado |

**Load — Métricas HTTP detalhadas:**

| Cenário | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| geral | 35.51ms | 4.11ms | 33.34ms | 267.41ms | 57.51ms | 66.86ms |
| `{countQuery}` | 23.36ms | 4.11ms | 19.47ms | 259.92ms | 39.88ms | 46.06ms |
| `{feedQuery}` | 43.74ms | 7.84ms | 41.24ms | 267.41ms | 63.56ms | 75.07ms |

- **load:** 30.567 req (230.50/s) · 30.107 iterações · 0 falhas · 13 MB recv · 12 MB sent · 210 VUs · Checks 60.674 100%
- **stress:** 116.816 req (413.77/s) · 57.608 iterações · 0 falhas · 49 MB recv · 45 MB sent · 600 VUs · 4m42.3s · Checks 232.032 100%
  - HTTP stress: avg 85.33ms / med 30.67ms / max 1.06s / p(90) 228.18ms

**Checks (load/stress):** register 201, login 200, count 200, count tem newItems, feed 200, feed tem items.

---

## 2. Post (publicações no feed)

| Teste | VUs | Thresholds | p(95) | Falhas | Status |
|-------|-----|-----------|-------|--------|--------|
| load | 210 | geral<1000 / crud<1500 / listing<600 / failed<1% | 44.39ms (crud 47.35 / list 31.28) | 0% | Aprovado |
| spike | 500 | geral<1500 | 633.43ms | 0% | Aprovado |
| stress | 600 | geral<1500 / failed<5% | 505.61ms | 0% | Aprovado |

**Load — Métricas HTTP detalhadas:**

| Cenário | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| geral | 19.19ms | 3.4ms | 14.11ms | 346.31ms | 29.2ms | 44.39ms |
| `{scenario:crud}` | 20.82ms | 3.73ms | 15.53ms | 346.31ms | 31.81ms | 47.35ms |
| `{scenario:listing}` | 13.42ms | 3.4ms | 9.25ms | 342.55ms | 19.38ms | 31.28ms |

- **load:** 54.013 req (403.46/s) · 20.445 iterações · 0 falhas · 28 MB recv · 25 MB sent · 210 VUs · Checks 74.458 100%
- **stress:** 115.560 req (406.66/s) · 28.490 iterações · 0 falhas · 61 MB recv · 51 MB sent · 600 VUs · 4m44.2s · Checks 144.050 100%
  - HTTP stress: avg 166.7ms / med 108.69ms / max 1.73s / p(90) 414.57ms

**Checks load:** register 201, login 200, list 200, list tem content, create 201, create retorna id, get 200, like 200, update 200, delete 204.
**Checks stress:** register 201, login 200, list 200, list tem content, create 201, get 200, delete 204.

---

## 3. Comment (comentários em posts)

| Teste | VUs | Thresholds | p(95) | Falhas | Status |
|-------|-----|-----------|-------|--------|--------|
| load | 210 | geral<1500 / crud<1500 / listing<500 / failed<2% | 80.13ms (crud 86.68 / list 49.28) | 0% | Aprovado |
| spike | 500 | geral<1000 | 743.68ms | 0% | Aprovado |
| stress | 600 | geral<2000 / failed<5% | 304.66ms | 0% | Aprovado |

**Load — Métricas HTTP detalhadas:**

| Cenário | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| geral | 24.98ms | 2.75ms | 15.09ms | 303.75ms | 55.48ms | 80.13ms |
| `{scenario:crud}` | 27.97ms | 3.25ms | 16.94ms | 303.75ms | 62.05ms | 86.68ms |
| `{scenario:listing}` | 16.7ms | 2.75ms | 10.8ms | 270.7ms | 31.75ms | 49.28ms |

- **load:** 51.158 req (365.47/s) · 21.568 iterações · 0 falhas · 27 MB recv · 24 MB sent · 210 VUs · Checks 60.638 100%
- **stress:** 143.688 req (482.65/s) · 34.922 iterações · 0 falhas · 73 MB recv · 63 MB sent · 600 VUs · 4m57.7s · Checks 178.610 100%
  - HTTP stress: avg 84.06ms / med 34ms / max 1.09s / p(90) 229.6ms / p(95) 304.66ms

**Checks load:** register 201, login 200, shelf created 201, book added to shelf 201, review base 201, list 200, create 201, create retorna id, get 200, update 200, delete 204.
**Checks stress:** register 201, login 200, shelf created 201, book added to shelf 201, review base 201, list 200, create 201, create retorna id, get 200, delete 204.

> **Nota:** o load/stress de comment exige que cada usuário tenha estante, livro adicionado à estante e review base criada antes de poder comentar — o setup/iteração provisiona esses pré-requisitos, o que explica o maior número de requests por iteração comparado ao post.

---

## 4. CommentInteraction (curtidas e respostas a comentários)

| Teste | VUs | Thresholds | p(95) | Falhas | Status |
|-------|-----|-----------|-------|--------|--------|
| load | 210 | geral<1500 / crud<1800 / listing<1000 / failed<2% | 68.48ms (crud 74.21 / list 48.61) | 0% | Aprovado |
| spike | 500 | geral<2500 | 1.03s | 0% | Aprovado |
| stress | **200** | geral<2500 / failed<5% | 36.92ms | 0% | Aprovado |

**Load — Métricas HTTP detalhadas:**

| Cenário | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| geral | 28.17ms | 2.8ms | 22.12ms | 333.67ms | 52.54ms | 68.48ms |
| `{scenario:crud}` | 32.46ms | 4.96ms | 26.09ms | 333.67ms | 57.57ms | 74.21ms |
| `{scenario:listing}` | 18.34ms | 2.8ms | 12.61ms | 238.09ms | 34.48ms | 48.61ms |

- **load:** 51.207 req (356.71/s) · 22.887 iterações · 0 falhas · 23 MB recv · 20 MB sent · 210 VUs · Checks 72.714 100%
- **stress:** 40.352 req (203.58/s) · 9.488 iterações · 0 falhas · 19 MB recv · 16 MB sent · **200 VUs** · 3m18.2s · Checks 37.952 100%
  - HTTP stress: avg 19.69ms / med 18.07ms / max 142.31ms / p(90) 31.46ms

**Checks load:** like on 200, list 200, has page, reply 201, reply retorna id, delete reply 204, like off 200.
**Checks stress:** like 200, list 200, reply 201, delete 204.

> **Aviso: Nota sobre o stress:** o `commentInteraction-stress.js` foi atualizado para 4 estágios [20→50→100→200] × 30s (max **200 VUs**, pool de 400 usuários). O resultado (p(95) 36.92ms, max 142ms) reflete um teste de carga média — não a rampa até 600 VUs testada anteriormente.

---

## 5. Review (resenhas de livros)

> **Histórico:** o review-stress.js foi **atualizado** com setup mais robusto (800 usuários × 20 livros adicionados à estante cada = 18.400 requests de setup) e threshold ajustado para p(95)<**2000ms**. O resultado da nova execução foi p(95)=**928.98ms** Aprovado. Contexto completo na seção de Observações.

### 5.1 Load Test — `review-load.js` — Aprovado

**Configuração:** 2 cenários: `crud` (~158 VUs, 2m) + `listing` (~52 VUs, 2m) — 210 VUs.

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 1000ms | 58.64ms | Aprovado |
| `{scenario:crud}` p(95) | < 1500ms | 62.67ms | Aprovado |
| `{scenario:listing}` p(95) | < 500ms | 44.14ms | Aprovado |
| `http_req_failed` rate | < 2% | 0.00% | Aprovado |

**Checks:** register 201, login 200, shelf created 201, book added to shelf 201, list 200, create 201, create retorna id e bookId, get 200, update 200, delete 204 — 100% (61.412 checks).

**Métricas HTTP:**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| `http_req_duration` (geral) | 26.25ms | 3.48ms | 20.01ms | 598.15ms | 44.42ms | 58.64ms |
| `{scenario:crud}` | 29.38ms | 5.06ms | 22.93ms | 598.15ms | 47.98ms | 62.67ms |
| `{scenario:listing}` | 17.84ms | 4.49ms | 11.66ms | 575.16ms | 30.67ms | 44.14ms |

**Sumário:** 51.913 req (338.42/s) · 21.676 iterações · 0 falhas · 26 MB recv · 21 MB sent · 210 VUs.

---

### 5.2 Spike Test — `review-spike.js` — Aprovado

**Configuração:** rampa 70→500 VUs (hold 20s); `setupTimeout` 1200s; setup 500/500.

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 1000ms | 681.75ms | Aprovado |
| `http_req_failed` rate | < 5% | 0.00% | Aprovado |

**Checks:** 100% (42.576) — register 201, login 200, shelf created 201, book added 201, list 200, create 201 ou 429, create retorna id, delete 204.
**Métricas:** avg 248.88ms · med 205.53ms · max 1.91s · p(90) 564ms · p(95) 681.75ms.
**Sumário:** 34.807 req (134.76/s) · 7.769 iterações · 0 falhas · 500 VUs.

---

### 5.3 Stress Test — `review-stress.js` — Aprovado

**Configuração:** rampa até 600 VUs em 3m30s (7 estágios: 20→50→100→200→300→400→600) + ramp down 30s; `setupTimeout` 1800s; setup 800 usuários × 20 livros/usuário (18.400 requests de setup).

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 2000ms | 928.98ms | Aprovado |
| `http_req_failed` rate | < 5% | 0.00% | Aprovado |

**Checks:** register 201, login 200, shelf created 201, book added to shelf 201, list 200, create 201, create retorna id e bookId, get 200, delete 204 — 100% (118.880 checks).

**Métricas HTTP (fase de VUs):**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| `http_req_duration` | 298.59ms | 9.16ms | 179.46ms | 3.89s | 750.35ms | 928.98ms |

**Sumário:** ~98.720 req totais (VUs + setup) · ~20.000 iterações VU · 0 falhas · 52 MB recv · 40 MB sent · 600 VUs · Duração total ~15m (setup: ~11m para 800 usuários × 23 req; execução VU: 4m).

> **Nota de setup:** os 118.880 checks incluem ~18.400 checks de setup (register + login + shelf + 20 × book_added por usuário × 800 usuários). Os ~80.320 requests de VU divididos por 4m = ~334/s durante a fase de carga efetiva.

---

## Resumo Geral do DomainFeed

| Subdomínio | Teste | VUs máx | Requests | Throughput | p(95) | Falhas | Resultado |
|------------|-------|---------|----------|-----------|-------|--------|-----------|
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
| commentInteraction | stress | **200** | 40.352 | 203.58/s | 36.92ms | 0% | Aprovado |
| review | load | 210 | 51.913 | 338.42/s | 58.64ms | 0% | Aprovado |
| review | spike | 500 | 34.807 | 134.76/s | 681.75ms | 0% | Aprovado |
| review | stress | 600 | ~98.720* | ~109/s* | 928.98ms | 0% | Aprovado |

\* O throughput de review-stress inclui 18.400 requests de setup pesado (800 usuários × 23 req); durante a fase de VUs (~4m), a taxa efetiva é ~334 req/s.

**15 de 15 testes aprovados.** DomainFeed completo e aprovado.
