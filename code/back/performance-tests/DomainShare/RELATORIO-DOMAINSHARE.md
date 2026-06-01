# Relatório de Performance — DomainShare

> **Data de execução:** 2026-05-28
> **Ferramenta:** k6 (Grafana) v1.7.1
> **Ambiente:** localhost:8080
> **Nota:** execução em máquina distinta da bateria DomainBook; banco com estado acumulado.

---

## Subdomínios Testados

| Subdomínio | Arquivos de teste | Status |
|------------|-------------------|--------|
| shareCard | shareCard-load.js, shareCard-spike.js, shareCard-stress.js | ✅ Todos passaram |

> O `shareCard` gera cards de leitura como imagem PNG. Conforme comentário nos scripts, a primeira
> requisição de cada card renderiza e as seguintes vêm de cache (Redis HIT), então o p(95) mistura
> render frio e cache quente.

---

## 1. ShareCard

### 1.1 Load Test — `shareCard-load.js`

**Configuração:** 1 cenário, 150 VUs, 2m.

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 1500ms | 39.77ms | ✅ |
| `http_req_failed` rate | < 1% | 0.00% | ✅ |

**Checks:** register 201, login 200, card 200, is PNG, has bytes — todos ✅ 100% (52.900 checks).

**Métricas HTTP:**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| geral | 31.79ms | 2.03ms | 22.52ms | 1.49s | 33.48ms | 39.77ms |

**Sumário:** 17.940 requests (135.24/s) · 0 falhas · **718 MB recv** / 6.6 MB sent · 2m13s.

---

### 1.2 Spike Test — `shareCard-spike.js`

**Configuração:** rampa 70→500 VUs em ~50s, 1m14s total.

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 3000ms | 27.36ms | ✅ |
| `http_req_failed` rate | < 5% | 0.00% | ✅ |

**Checks:** card 200 ou 429 — ✅ 100% (26.807 checks).

**Métricas HTTP:**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| geral | 10.75ms | 1.52ms | 7.47ms | 545.85ms | 23.21ms | 27.36ms |

**Sumário:** 27.807 requests (374.88/s) · 0 falhas · **1.1 GB recv** / 10 MB sent · 1m14s.

---

### 1.3 Stress Test — `shareCard-stress.js`

**Configuração:** rampa até 600 VUs, 4m38s total.

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 3000ms | 35.36ms | ✅ |
| `http_req_failed` rate | < 5% | 0.00% | ✅ |

**Checks:** card 200 — ✅ 100% (97.323 checks).

**Métricas HTTP:**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| geral | 15.11ms | 126µs | 11.15ms | 996.77ms | 28.43ms | 35.36ms |

**Sumário:** 98.923 requests (354.81/s) · 0 falhas · **3.9 GB recv** / 37 MB sent · 4m.

---

## Resumo Geral do DomainShare

| Subdomínio | Teste | VUs máx | Requests | Throughput | p(95) | Falhas | Resultado |
|------------|-------|---------|----------|-----------|-------|--------|-----------|
| shareCard | load | 150 | 17.940 | 135.24/s | 39.77ms | 0% | ✅ |
| shareCard | spike | 500 | 27.807 | 374.88/s | 27.36ms | 0% | ✅ |
| shareCard | stress | 600 | 98.923 | 354.81/s | 35.36ms | 0% | ✅ |

**Taxa de falhas geral:** 0% · **Todos os thresholds:** ✅ aprovados.
**Destaque:** **maior volume de dados de toda a suíte** — 3.9 GB recebidos no stress (imagens PNG), com p(95) de apenas 35ms graças ao cache Redis.
