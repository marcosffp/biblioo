# Relatório de Performance — DomainTrending

> **Data de execução:** 2026-05-28
> **Ferramenta:** k6 (Grafana) v1.7.1
> **Ambiente:** localhost:8080
> **Nota:** execução em máquina distinta da bateria DomainBook; banco com estado acumulado.

---

## Subdomínios Testados

| Subdomínio | Arquivos de teste | Status |
|------------|-------------------|--------|
| trending | trending-load.js, trending-spike.js, trending-stress.js | ✅ Todos passaram |

> `trending` agrega dados de múltiplos domínios (comunidades e livros em alta). Cada iteração consulta
> `GET /trending/communities` e `GET /trending/books`.

---

## 1. Trending

### 1.1 Load Test — `trending-load.js`

**Configuração:** 1 cenário `browse_trending`, 210 VUs, 2m.

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 500ms | 37.62ms | ✅ |
| `{trending/communities}` p(95) | < 500ms | 37.89ms | ✅ |
| `{trending/books}` p(95) | < 500ms | 38.18ms | ✅ |
| `http_req_failed` rate | < 2% | 0.00% | ✅ |

**Checks:** owner register/login 201/200, create community 201, register/login, GET /trending/communities 200, /trending/books 200, ambos array — todos ✅ 100% (97.907 checks).

**Métricas HTTP:**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| geral | 19.06ms | 2.04ms | 17.51ms | 189.71ms | 30.96ms | 37.62ms |

**Sumário:** 51.029 requests (340.70/s) · 0 falhas · 181 MB recv / 19 MB sent · 2m30s.

---

### 1.2 Spike Test — `trending-spike.js`

**Configuração:** rampa 70→500 VUs, 1m53s total.

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 1000ms | 17.4ms | ✅ |
| `http_req_failed` rate | < 5% | 0.00% | ✅ |
| `trending_error_rate` | < 5% | 0.00% | ✅ |

**Checks:** owner register, register/login, /trending/communities 200||429, /trending/books 200||429, arrays — todos ✅ 100% (55.437 checks).

**Métricas HTTP:**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| geral | 7.92ms | 1.77ms | 7ms | 317.16ms | 13.22ms | 17.4ms |

**Sumário:** 32.227 requests (285.26/s) · 0 falhas · 97 MB recv / 12 MB sent · 1m53s.

---

### 1.3 Stress Test — `trending-stress.js`

**Configuração:** rampa até 600 VUs, 5m02s total.

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 2000ms | 25.57ms | ✅ |
| `http_req_failed` rate | < 5% | 0.00% (7/102.437) | ✅ |
| `trending_error_rate` | < 5% | 0.00% | ✅ |

**Checks:** 99.99% (198.456 de 198.457). 1 falha isolada em `owner register 201` (setup, transitória).

**Métricas HTTP:**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| geral | 11.11ms | 192µs | 8.26ms | 440.37ms | 21.48ms | 25.57ms |

**Sumário:** 102.437 requests (338.90/s) · 7 falhas HTTP (0.00%) · 346 MB recv / 39 MB sent · 4m.

---

## Resumo Geral do DomainTrending

| Subdomínio | Teste | VUs máx | Requests | Throughput | p(95) | Falhas | Resultado |
|------------|-------|---------|----------|-----------|-------|--------|-----------|
| trending | load | 210 | 51.029 | 340.70/s | 37.62ms | 0% | ✅ |
| trending | spike | 500 | 32.227 | 285.26/s | 17.4ms | 0% | ✅ |
| trending | stress | 600 | 102.437 | 338.90/s | 25.57ms | 0.00% (7) | ✅ |

**Taxa de falhas geral:** ~0% · **Todos os thresholds:** ✅ aprovados.
**Destaque:** mesmo agregando dados de múltiplos domínios, p(95) ≤ 38ms em todos os testes — forte indício de cache/materialização eficiente dos rankings de trending.