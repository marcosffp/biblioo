# Relatório de Performance — DomainUser

> **Data de execução:** 2026-05-28
> **Ferramenta:** k6 (Grafana) v1.7.1
> **Ambiente:** localhost:8080
> **Nota:** execução em máquina distinta da bateria DomainBook; banco com estado acumulado de execuções anteriores.

---

## Subdomínios Testados

| Subdomínio | Arquivos de teste | Status |
|------------|-------------------|--------|
| user | user-load.js, user-spike.js, user-stress.js | ✅ Todos passaram |

---

## 1. User

### 1.1 Load Test — `user-load.js`

**Configuração:** 2 cenários — `auth` (84 VUs) + `profile` (126 VUs), 210 VUs total, 2m.

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 1000ms | 58.77ms | ✅ |
| `{scenario:auth}` p(95) | < 2000ms | 79.23ms | ✅ |
| `{scenario:profile}` p(95) | < 500ms | 34.85ms | ✅ |
| `http_req_failed` rate | < 1% | 0.00% | ✅ |

**Checks:** register 201, login 200, GET /me 200, GET /{username} 200, login retorna token — todos ✅ 100% (59.186 checks).

**Métricas HTTP:**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| geral | 20.33ms | 1.79ms | 9.33ms | 725.47ms | 45.46ms | 58.77ms |
| auth | 42.42ms | 20.93ms | 34.47ms | 460.97ms | 65.82ms | 79.23ms |
| profile | 11.49ms | 1.79ms | 6.22ms | 725.47ms | 24.51ms | 34.85ms |

**Sumário:** 51.880 requests (389.96/s) · 0 falhas · 36 MB recv / 17 MB sent · 2m13s.

---

### 1.2 Spike Test — `user-spike.js`

**Configuração:** rampa 70→500 VUs em ~50s (5 estágios), 1m15s total.

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 2000ms | 16.45ms | ✅ |
| `http_req_failed` rate | < 5% | 0.00% | ✅ |

**Checks:** register 201, login 200 (+ checks de perfil) — todos ✅ 100% (34.842 checks).

**Métricas HTTP:**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| geral | 6.7ms | 1.86ms | 5.4ms | 604.94ms | 10.09ms | 16.45ms |

**Sumário:** 34.842 requests (464.37/s) · 0 falhas · 21 MB recv / 13 MB sent · 1m15s.

---

### 1.3 Stress Test — `user-stress.js`

**Configuração:** rampa até 600 VUs (7 estágios + descida), 4m38s total.

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 5000ms | 147ms | ✅ |
| `http_req_failed` rate | < 10% | 0.00% | ✅ |

**Checks:** register 201, login 200, GET /me 200, GET /{username} 200 — todos ✅ 100% (427.830 checks).

**Métricas HTTP:**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| geral | 42.26ms | 1.99ms | 21.88ms | 714.52ms | 107.66ms | 147ms |

**Sumário:** **427.830 requests (1538.35/s)** · 0 falhas · 257 MB recv / 159 MB sent · 4m.

---

## Resumo Geral do DomainUser

| Subdomínio | Teste | VUs máx | Requests | Throughput | p(95) | Falhas | Resultado |
|------------|-------|---------|----------|-----------|-------|--------|-----------|
| user | load | 210 | 51.880 | 389.96/s | 58.77ms | 0% | ✅ |
| user | spike | 500 | 34.842 | 464.37/s | 16.45ms | 0% | ✅ |
| user | stress | 600 | 427.830 | 1538.35/s | 147ms | 0% | ✅ |

**Taxa de falhas geral:** 0% · **Todos os thresholds:** ✅ aprovados.
**Destaque:** maior throughput observado em toda a suíte — **1538 req/s** no stress com 600 VUs, p(95) de apenas 147ms.
