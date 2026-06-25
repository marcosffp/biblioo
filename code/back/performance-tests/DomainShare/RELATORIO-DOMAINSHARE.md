# Relatório de Performance — DomainShare

> **Data de execução:** 2026-06-24  
> **Ferramenta:** k6 (Grafana) v1.7.1  
> **Ambiente:** localhost:8080  
> **Nota:** banco com estado acumulado de execuções anteriores.

---

## Subdomínios Testados

| Subdomínio | Arquivos de teste | Status |
|------------|-------------------|--------|
| shareCard | shareCard-load.js, shareCard-spike.js, shareCard-stress.js | Todos passaram |

> O `shareCard` gera cards de leitura como imagem PNG. Conforme comentário nos scripts, a primeira
> requisição de cada card renderiza e as seguintes vêm de cache (Redis HIT por userId, TTL 1h), então o p(95) mistura
> render frio e cache quente.

---

## 1. ShareCard

### 1.1 Load Test — `shareCard-load.js`

**Configuração:** 1 cenário (`card`), 150 VUs constantes, 2m. Pool de setup: 230 usuários. Sleep: 1s por iteração.

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 1500ms | 118.01ms | Aprovado |
| `http_req_failed` rate | < 1% | 0.00% | Aprovado |

**Checks:** register 201, login 200, card 200, is PNG, has bytes — todos 100% (50.557 checks).

**Métricas HTTP:**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| geral | 80.46ms | 9.93ms | 42.3ms | 4.98s | 86.54ms | 118.01ms |

**Sumário:** 17.159 requests (113.32/s) · 16.699 iterações · 0 falhas · **678 MB recv** / 6.3 MB sent · ~2m31s total (2m VU + setup 230 usuários).

---

### 1.2 Spike Test — `shareCard-spike.js`

**Configuração:** rampa 70→500 VUs em ~50s, 1m14s total.

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 3000ms | 29.21ms | Aprovado |
| `http_req_failed` rate | < 5% | 0.00% | Aprovado |

**Checks:** card 200 ou 429 — 100% (26.787 checks).

**Métricas HTTP:**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| geral | 11.1ms | 1.62ms | 7.07ms | 594.49ms | 22.79ms | 29.21ms |

**Sumário:** 27.787 requests (373.38/s) · 0 falhas · **1.1 GB recv** / 10 MB sent · 1m14.4s.

---

### 1.3 Stress Test — `shareCard-stress.js`

**Configuração:** rampa até 600 VUs (7 estágios: 20→50→100→200→300→400→600 × 30s + descida). Pool de setup: 800 usuários. Sleep: 0.5s por iteração.

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 3000ms | 57.42ms | Aprovado |
| `http_req_failed` rate | < 5% | 0.00% | Aprovado |

**Checks:** card 200 — 100% (96.786 checks).

**Métricas HTTP:**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| geral | 10.7ms | 3.73ms | 8.53ms | 1.03s | 41.45ms | 57.42ms |

**Sumário:** ~98.386 requests (~299.6/s) · 96.786 iterações · 0 falhas · **3.9 GB recv** / 48 MB sent · 5m28.4s total (4m VU + ~1m28s setup 800 usuários).

---

## Resumo Geral do DomainShare

| Subdomínio | Teste | VUs máx | Requests | Throughput | p(95) | Falhas | Resultado |
|------------|-------|---------|----------|-----------|-------|--------|-----------|
| shareCard | load | 150 | 17.159 | 113.32/s | 118.01ms | 0% | Aprovado |
| shareCard | spike | 500 | 27.787 | 373.38/s | 29.21ms | 0% | Aprovado |
| shareCard | stress | 600 | ~98.386 | ~299.6/s | 57.42ms | 0% | Aprovado |

**Taxa de falhas geral:** 0% · **Todos os thresholds:** aprovados.  
**Destaque:** **maior volume de dados de toda a suíte** — 3.9 GB recebidos no stress (imagens PNG), com p(95) de apenas 57ms graças ao cache Redis.
