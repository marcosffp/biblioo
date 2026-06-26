# Relatório de Performance — DomainBook

> **Data de execução:** 2026-06-24  
> **Ferramenta:** k6 (Grafana)  
> **Ambiente:** localhost:8080  

---

## Subdomínios Testados

| Subdomínio  | Arquivos de teste                                    | Status  |
|-------------|------------------------------------------------------|---------|
| book        | books-load.js, books-spike.js, books-stress.js       | Todos passaram |
| collection  | collection-load.js, collection-spike.js, collection-stress.js | Todos passaram |
| shelf       | shelf-load.js, shelf-spike.js, shelf-stress.js       | Todos passaram |
| shelfItem   | shelfItem-load.js, shelfItem-spike.js, shelfItem-stress.js | Todos passaram |

---

## 1. Book

### 1.1 Load Test — `books-load.js`

**Configuração:**
- 2 cenários simultâneos: `details` (20 VUs, 2m) + `search` (80 VUs, 2m)
- 100 VUs total, duração 2m

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 1500ms | 33.83ms | Aprovado |
| `http_req_duration{scenario:details}` p(95) | < 800ms | 14.1ms | Aprovado |
| `http_req_duration{scenario:search}` p(95) | < 2000ms | 36.17ms | Aprovado |
| `http_req_failed` rate | < 1% | 0.00% | Aprovado |
| `http_req_waiting` p(95) | < 1200ms | 33.57ms | Aprovado |

**Checks:**

| Check | Resultado |
|-------|-----------|
| status 200 ou 404 | 100% |
| status 200 | 100% |
| body é array JSON | 100% |

**Métricas HTTP:**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| `http_req_duration` (geral) | 14.05ms | 743µs | 11.34ms | 60.7ms | 28.75ms | 33.83ms |
| `{scenario:details}` | 7.59ms | 743µs | 6.67ms | 23.09ms | 12.98ms | 14.1ms |
| `{scenario:search}` | 17.23ms | 93µs | 15.03ms | 60.7ms | 31.96ms | 36.17ms |

**Sumário:**
- Total de requests: **14.160** (117.82/s)
- Iterações completas: 14.160
- Dados recebidos: **176 MB** (1.5 MB/s)
- Dados enviados: 1.3 MB (11 kB/s)
- Duração total: 2m0.2s

---

### 1.2 Spike Test — `books-spike.js`

**Configuração:**
- 1 cenário: rampa até 300 VUs em 50s (5 estágios), gracefulRampDown 30s

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 1000ms | 18.91ms | Aprovado |
| `http_req_failed` rate | < 5% | 0.00% | Aprovado |

**Checks:**

| Check | Resultado |
|-------|-----------|
| search status 200 | 100% |
| search body array | 100% |
| detail status 200 ou 404 | 100% |

**Métricas HTTP:**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| `http_req_duration` | 6.4ms | 595µs | 4.2ms | 381.95ms | 13.24ms | 18.91ms |

**Sumário:**
- Total de requests: **32.462** (646.66/s)
- Iterações completas: 16.231
- Dados recebidos: **291 MB** (5.8 MB/s)
- Dados enviados: 2.9 MB (58 kB/s)
- Duração total: 50.2s

---

### 1.3 Stress Test — `books-stress.js`

**Configuração:**
- 1 cenário: rampa até 400 VUs em 3m (6 estágios: 20→50→100→200→300→400), gracefulRampDown 30s

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 1000ms | 100.89ms | Aprovado |
| `http_req_failed` rate | < 5% | 0.00% | Aprovado |

**Checks:**

| Check | Resultado |
|-------|-----------|
| search status 200 | 100% |
| search body array | 100% |
| detail status 200 ou 404 | 100% |

**Métricas HTTP:**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| `http_req_duration` | 29.58ms | 941µs | 14.49ms | 663.55ms | 62.75ms | 100.89ms |

**Sumário:**
- Total de requests: **114.684** (545.6/s)
- Iterações completas: 57.342
- Dados recebidos: **1.1 GB** (5.4 MB/s)
- Dados enviados: 10 MB (48 kB/s)
- Duração total: 3m30.2s

---

## 2. Collection

### 2.1 Load Test — `collection-load.js`

**Configuração:**
- 2 cenários: `crud` (150 VUs, 2m) + `listing` (60 VUs, 2m)
- 210 VUs total

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 1000ms | 34.44ms | Aprovado |
| `http_req_duration{scenario:crud}` p(95) | < 1500ms | 36.51ms | Aprovado |
| `http_req_duration{scenario:listing}` p(95) | < 1500ms | 30.03ms | Aprovado |
| `http_req_failed` rate | < 1% | 0.00% | Aprovado |

**Checks:**

| Check | Resultado |
|-------|-----------|
| register 201 | 100% |
| login 200 | 100% |
| setup shelf 201 | 100% |
| create 201 | 100% |
| create retorna id | 100% |
| list 200 | 100% |
| list é array JSON | 100% |
| get collection 200 | 100% |
| add shelf 200 | 100% |
| remove shelf 200 | 100% |
| update 200 | 100% |
| delete 204 | 100% |

**Métricas HTTP:**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| `http_req_duration` (geral) | 16.57ms | 3.09ms | 12.07ms | 258.16ms | 25.16ms | 34.44ms |
| `{scenario:crud}` | 15.93ms | 3.26ms | 12.3ms | 258.16ms | 25.93ms | 36.51ms |
| `{scenario:listing}` | 14.4ms | 3.09ms | 11.53ms | 258.16ms | 22.86ms | 30.03ms |

**Sumário:**
- Total de requests: **57.031** (424.57/s)
- Iterações completas: 21.091
- Dados recebidos: **28 MB** (211 kB/s)
- Dados enviados: 25 MB (184 kB/s)
- Duração total: 2m14.3s

---

### 2.2 Spike Test — `collection-spike.js`

**Configuração:**
- 1 cenário: rampa até 500 VUs em 50s (5 estágios)
- AVISO: 100.254 séries temporais únicas

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 2500ms | 574.91ms | Aprovado |
| `http_req_failed` rate | < 5% | 0.00% | Aprovado |

**Checks:**

| Check | Resultado |
|-------|-----------|
| list 200 | 100% |
| list array | 100% |
| create 201 ou 429 | 100% |
| add shelf 200 ou 429 | 100% |

**Métricas HTTP:**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| `http_req_duration` | 170.13ms | 3.05ms | 130.35ms | 1.97s | 299.8ms | 574.91ms |

**Sumário:**
- Total de requests: **32.148** (397.02/s)
- Iterações completas: 7.662
- Dados recebidos: **15 MB** (188 kB/s)
- Dados enviados: 14 MB (174 kB/s)
- Duração total: 1m21.0s

---

### 2.3 Stress Test — `collection-stress.js`

**Configuração:**
- 1 cenário: rampa até 600 VUs em 3m30s (7 estágios: 20→50→100→200→300→400→600), gracefulRampDown 30s
- Pool de 800 usuários pré-criados no setup

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 2500ms | 250.07ms | Aprovado |
| `http_req_failed` rate | < 5% | 0.00% | Aprovado |

**Checks:**

| Check | Resultado |
|-------|-----------|
| list 200 | 100% |
| list array | 100% |
| create 201 | 100% |
| get 200 | 100% |
| add shelf 200 | 100% |
| remove shelf 200 | 100% |
| update 200 | 100% |
| delete 204 | 100% |

**Métricas HTTP:**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| `http_req_duration` | 67.5ms | 2.62ms | 22.1ms | 1.7s | 170.84ms | 250.07ms |

**Sumário:**
- Total de requests: **165.283** (~594/s)
- Iterações completas: 23.269
- Dados recebidos: **84 MB** (≈302 kB/s)
- Dados enviados: 75 MB (≈270 kB/s)
- Duração total: 4m38.3s

---

## 3. Shelf

### 3.1 Load Test — `shelf-load.js`

**Configuração:**
- 2 cenários: `crud` (150 VUs, 2m) + `listing` (60 VUs, 2m)
- 210 VUs total

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 1000ms | 47.24ms | Aprovado |
| `http_req_duration{scenario:crud}` p(95) | < 1500ms | 50.33ms | Aprovado |
| `http_req_duration{scenario:listing}` p(95) | < 1500ms | 40.58ms | Aprovado |
| `http_req_failed` rate | < 1% | 0.00% | Aprovado |

**Checks:**

| Check | Resultado |
|-------|-----------|
| register 201 | 100% |
| login 200 | 100% |
| create 201 | 100% |
| create retorna id | 100% |
| list 200 | 100% |
| list é array JSON | 100% |
| get shelf 200 | 100% |
| update 200 | 100% |
| delete 204 | 100% |

**Métricas HTTP:**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| `http_req_duration` (geral) | 19.02ms | 3.08ms | 13.66ms | 322.68ms | 34.95ms | 47.24ms |
| `{scenario:crud}` | 19.02ms | 3.08ms | 13.91ms | 322.68ms | 38.1ms | 50.33ms |
| `{scenario:listing}` | 17.55ms | 3.14ms | 12.51ms | 230.88ms | 32.76ms | 40.58ms |

**Sumário:**
- Total de requests: **50.980** (384.72/s)
- Iterações completas: 23.070
- Dados recebidos: **23 MB** (173 kB/s)
- Dados enviados: 21 MB (161 kB/s)
- Duração total: 2m12.5s

---

### 3.2 Spike Test — `shelf-spike.js`

**Configuração:**
- 1 cenário: rampa até 500 VUs em 50s (5 estágios)
- AVISO: 100.307 séries temporais únicas

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 2500ms | 396.55ms | Aprovado |
| `http_req_failed` rate | < 5% | 0.00% | Aprovado |

**Checks:**

| Check | Resultado |
|-------|-----------|
| list 200 | 100% |
| list array | 100% |
| create 201 ou 429 | 100% |

**Métricas HTTP:**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| `http_req_duration` | 139.77ms | 2.75ms | 96.45ms | 1.12s | 327.16ms | 396.55ms |

**Sumário:**
- Total de requests: **37.507** (500.90/s)
- Iterações completas: 12.169
- Dados recebidos: **16 MB** (212 kB/s)
- Dados enviados: 16 MB (208 kB/s)
- Duração total: 1m14.9s

---

### 3.3 Stress Test — `shelf-stress.js`

**Configuração:**
- 1 cenário: rampa até 600 VUs em 3m30s (7 estágios: 20→50→100→200→300→400→600), gracefulRampDown 30s
- Pool de 800 usuários pré-criados no setup

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 2500ms | 128.61ms | Aprovado |
| `http_req_failed` rate | < 5% | 0.00% | Aprovado |

**Checks:**

| Check | Resultado |
|-------|-----------|
| list 200 | 100% |
| list array | 100% |
| create 201 | 100% |
| get 200 | 100% |
| delete 204 | 100% |

**Métricas HTTP:**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| `http_req_duration` | 33.91ms | 2.51ms | 13.95ms | 480.75ms | 98.83ms | 128.61ms |

**Sumário:**
- Total de requests: **164.588** (594.4/s)
- Iterações completas: 40.747
- Dados recebidos: **72 MB** (268 kB/s)
- Dados enviados: 69 MB (248 kB/s)
- Duração total: 4m36.9s

---

## 4. ShelfItem

### 4.1 Load Test — `shelfItem-load.js`

**Configuração:**
- 2 cenários: `crud` (150 VUs, 2m) + `listing` (60 VUs, 2m)
- 210 VUs total

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 1000ms | 43.89ms | Aprovado |
| `http_req_duration{scenario:crud}` p(95) | < 1500ms | 49.4ms | Aprovado |
| `http_req_duration{scenario:listing}` p(95) | < 1500ms | 19.1ms | Aprovado |
| `http_req_failed` rate | < 1% | 0.00% | Aprovado |

**Checks:**

| Check | Resultado |
|-------|-----------|
| register 201 | 100% |
| login 200 | 100% |
| setup shelf 201 | 100% |
| list items 200 | 100% |
| list é array JSON | 100% |
| add item 201 | 100% |
| add item retorna id | 100% |
| get item 200 | 100% |
| update progress 200 | 100% |
| change status 200 | 100% |
| remove item 204 | 100% |

**Métricas HTTP:**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| `http_req_duration` (geral) | 17.99ms | 2.45ms | 14.91ms | 343.71ms | 30.66ms | 43.89ms |
| `{scenario:crud}` | 21.17ms | 3.66ms | 17.01ms | 343.71ms | 35.23ms | 49.4ms |
| `{scenario:listing}` | 9.2ms | 2.45ms | 6.6ms | 330.84ms | 12.47ms | 19.1ms |

**Sumário:**
- Total de requests: **54.130** (402.25/s)
- Iterações completas: 22.012
- Dados recebidos: **29 MB** (217 kB/s)
- Dados enviados: 23 MB (172 kB/s)
- Duração total: 2m12.2s

---

### 4.2 Spike Test — `shelfItem-spike.js`

**Configuração:**
- 1 cenário: rampa até 500 VUs em 50s (5 estágios)

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 2500ms | 475.65ms | Aprovado |
| `http_req_failed` rate | < 5% | 0.00% | Aprovado |

**Checks:**

| Check | Resultado |
|-------|-----------|
| list items 200 | 100% |
| list array | 100% |
| add item 201 ou 429 | 100% |
| update progress 200 ou 429 | 100% |

**Métricas HTTP:**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| `http_req_duration` | 247.07ms | 3.89ms | 299.29ms | 922.93ms | 415.2ms | 475.65ms |

**Sumário:**
- Total de requests: **27.632** (344.98/s)
- Iterações completas: 6.533
- Dados recebidos: **15 MB** (191 kB/s)
- Dados enviados: 12 MB (151 kB/s)
- Duração total: 1m20.1s

---

### 4.3 Stress Test — `shelfItem-stress.js`

**Configuração:**
- 1 cenário: rampa até 600 VUs em 3m30s (7 estágios: 20→50→100→200→300→400→600), gracefulRampDown 30s
- Pool de 800 usuários pré-criados no setup (setupTimeout: 300s)
- Lógica de recuperação de 409 em `add item`: lista itens, remove remanescente e refaz o POST

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 3000ms | 717.87ms | Aprovado |
| `http_req_failed` rate | < 5% | 0.00% | Aprovado |

**Checks:**

| Check | Resultado |
|-------|-----------|
| list items 200 | 100% |
| list array | 100% |
| add item 201 | 100% |
| get item 200 | 100% |
| update progress 200 | 100% |
| change status 200 | 100% |
| remove item 204 | 100% |

**Métricas HTTP:**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| `http_req_duration` | 249.05ms | 4.25ms | 177.89ms | 1.92s | 599.87ms | 717.87ms |

**Sumário:**
- Total de requests: **103.345** (331.39/s)
- Iterações completas: 16.824
- Dados recebidos: **59 MB** (189 kB/s)
- Dados enviados: 46 MB (148 kB/s)
- Duração total: 5m11.9s (inclui ~1m10s de setup para criação de 800 usuários)

---

## Resumo Geral do DomainBook

| Subdomínio | Teste | VUs máx | Requests | Throughput | p(95) | Falhas | Resultado |
|------------|-------|---------|----------|-----------|-------|--------|-----------|
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

**Total de requests executados no DomainBook:** ~923.103  
**Taxa de falhas geral:** 0%  
**Todos os thresholds:** aprovados
