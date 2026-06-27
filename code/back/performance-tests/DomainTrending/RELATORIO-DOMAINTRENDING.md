# Relatório de Performance — DomainTrending

> **Data de execução:** 2026-06-24
> **Ferramenta:** k6 (Grafana) v1.7.1
> **Ambiente:** localhost:8080

---

## Subdomínios Testados

| Subdomínio | Arquivos de teste | Status |
|------------|-------------------|--------|
| trending | trending-load.js, trending-spike.js, trending-stress.js | Todos passaram |

> `trending` agrega dados de múltiplos domínios (comunidades e livros em alta). Cada iteração consulta
> `GET /trending/communities` e `GET /trending/books`.

---

## 1. Trending

### 1.1 Load Test — `trending-load.js`

**Configuração:** 1 cenário `browse_trending`, 210 VUs constantes, 2m. Pool de setup: 230 usuários; cada usuário entra em 5 comunidades, cria estante, item e review. Sleep: 1s por iteração.

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 500ms | 31.3ms | Aprovado |
| `{name:GET_trending_books}` p(95) | < 500ms | 31.76ms | Aprovado |
| `{name:GET_trending_communities}` p(95) | < 500ms | 31.62ms | Aprovado |
| `http_req_failed` rate | < 2% | 0.00% | Aprovado |
| `trending_error_rate` | < 2% | 0.00% | Aprovado |

**Checks:** owner register/login 201/200, create community 201, register/login, GET /trending/communities 200, trending/communities é array, GET /trending/books 200, trending/books é array — todos 100% (98.407 checks).

**Métricas HTTP:**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| geral | 16.56ms | 2.19ms | 14.51ms | 178.91ms | 26.81ms | 31.3ms |

**Métricas Customizadas:**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| `trending_books_latency` | 16.73ms | 2.19ms | 14.63ms | 113.53ms | 20.67ms | 31.76ms |
| `trending_communities_latency` | 16.73ms | 2.37ms | 14.62ms | 178.91ms | 27.24ms | 31.62ms |

**Sumário:** 51.279 requests (341.08/s) · 24.485 iterações · 0 falhas · **164 MB recv** / 19 MB sent · ~2m30s total (2m VU + setup 230 usuários).

---

### 1.2 Spike Test — `trending-spike.js`

**Configuração:** rampa 70→500 VUs, 1m57.6s total.

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 1000ms | 16.51ms | Aprovado |
| `http_req_failed` rate | < 5% | 0.00% | Aprovado |
| `trending_error_rate` | < 5% | 0.00% | Aprovado |

**Checks:** owner register, register/login, /trending/communities 200||429, /trending/books 200||429, arrays — todos 100% (55.525 checks).

**Métricas HTTP:**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| geral | 6.98ms | 1.88ms | 5.8ms | 67.61ms | 10.8ms | 16.51ms |

**Latências por endpoint:** `trending_books_latency` p(95) 9.78ms · `trending_communities_latency` p(95) 10.99ms.

**Sumário:** 32.271 requests (274.52/s) · 0 falhas · 98 MB recv / 12 MB sent · 1m57.6s.

---

### 1.3 Stress Test — `trending-stress.js`

**Configuração:** rampa até 600 VUs (7 estágios: 20→50→100→200→300→400→600 × 30s + descida). Pool: 800 usuários. Sleep: 1s por iteração.

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 2000ms | ~23.8ms | Aprovado |
| `http_req_failed` rate | < 5% | 0.00% (7/~102.8k) | Aprovado |
| `trending_error_rate` | < 5% | 0.00% | Aprovado |

**Checks:** register 201, login 200, GET /trending/communities 200||429, trending/communities é array, GET /trending/books 200||429, trending/books é array — todos Aprovado **100%** (~199.116 de ~199.116).

**Métricas HTTP:**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| geral | ~8.82ms | ~2.15ms | ~7.21ms | ~173.42ms | ~17.13ms | ~23.8ms |

**Métricas Customizadas:**

| Métrica | avg | p(90) | p(95) |
|---------|-----|-------|-------|
| `trending_books_latency` | ~8.9ms | ~15.12ms | ~20.25ms |
| `trending_communities_latency` | ~8.75ms | ~14.50ms | ~17.13ms |

**Sumário:** ~102.8k requests (~300/s) · 49.379 iterações completas + 8 interrompidas · 7 falhas HTTP (0.00%) · ~351 MB recv / ~39 MB sent · 5m42.7s total (4m VU + ~1m43s setup 800 usuários).

---

## Resumo Geral do DomainTrending

| Subdomínio | Teste | VUs máx | Requests | Throughput | p(95) | Falhas | Resultado |
|------------|-------|---------|----------|-----------|-------|--------|-----------|
| trending | load | 210 | 51.279 | 341.08/s | 31.3ms | 0% | Aprovado |
| trending | spike | 500 | 32.271 | 274.52/s | 16.51ms | 0% | Aprovado |
| trending | stress | 600 | ~102.8k | ~300/s | ~23.8ms | 0.00% (7) | Aprovado |

**Taxa de falhas geral:** ~0% · **Todos os thresholds:** aprovados.
**Destaque:** mesmo agregando dados de múltiplos domínios, p(95) ≤ 32ms em todos os testes — forte indício de cache/materialização eficiente dos rankings de trending.
