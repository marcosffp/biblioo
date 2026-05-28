# Relatório de Performance — DomainBook

> **Data de execução:** 2026-05-28  
> **Ferramenta:** k6 (Grafana)  
> **Ambiente:** localhost:8080  

---

## Subdomínios Testados

| Subdomínio  | Arquivos de teste                                    | Status  |
|-------------|------------------------------------------------------|---------|
| book        | books-load.js, books-spike.js, books-stress.js       | ✅ Todos passaram |
| collection  | collection-load.js, collection-spike.js, collection-stress.js | ✅ Todos passaram |
| shelf       | shelf-load.js, shelf-spike.js, shelf-stress.js       | ✅ Todos passaram |
| shelfItem   | shelfItem-load.js, shelfItem-spike.js, shelfItem-stress.js | ✅ Todos passaram |

---

## 1. Book

### 1.1 Load Test — `books-load.js`

**Configuração:**
- 2 cenários simultâneos: `details` (20 VUs, 2m) + `search` (80 VUs, 2m)
- 100 VUs total, duração 2m

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 1500ms | 32.51ms | ✅ |
| `http_req_duration{scenario:details}` p(95) | < 800ms | 12.34ms | ✅ |
| `http_req_duration{scenario:search}` p(95) | < 2000ms | 35.02ms | ✅ |
| `http_req_failed` rate | < 1% | 0.00% | ✅ |
| `http_req_waiting` p(95) | < 1200ms | 32.4ms | ✅ |

**Checks:**

| Check | Resultado |
|-------|-----------|
| status 200 ou 404 | ✅ 100% |
| status 200 | ✅ 100% |
| body é array JSON | ✅ 100% |

**Métricas HTTP:**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| `http_req_duration` (geral) | 20.13ms | 836µs | 12.13ms | 3.68s | 28.23ms | 32.51ms |
| `{scenario:details}` | 6.66ms | 836µs | 6.2ms | 65.83ms | 9.32ms | 12.34ms |
| `{scenario:search}` | 26.94ms | 863µs | 17.64ms | 3.68s | 30.57ms | 35.02ms |

**Sumário:**
- Total de requests: **14.127** (116.9/s)
- Iterações completas: 14.127
- Dados recebidos: **168 MB** (1.4 MB/s)
- Dados enviados: 1.3 MB (11 kB/s)
- Duração total: 2m00.8s

---

### 1.2 Spike Test — `books-spike.js`

**Configuração:**
- 1 cenário: rampa até 300 VUs em 50s (5 estágios), gracefulRampDown 30s

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 1000ms | 8.42ms | ✅ |
| `http_req_failed` rate | < 5% | 0.00% | ✅ |

**Checks:**

| Check | Resultado |
|-------|-----------|
| search status 200 | ✅ 100% |
| search body array | ✅ 100% |
| detail status 200 ou 404 | ✅ 100% |

**Métricas HTTP:**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| `http_req_duration` | 3.1ms | 454µs | 2.19ms | 56.84ms | 6.34ms | 8.42ms |

**Sumário:**
- Total de requests: **32.884** (651.6/s)
- Iterações completas: 16.442
- Dados recebidos: **306 MB** (6.1 MB/s)
- Dados enviados: 3.0 MB (59 kB/s)
- Duração total: 50.5s

---

### 1.3 Stress Test — `books-stress.js`

**Configuração:**
- 1 cenário: rampa até 400 VUs em 3m30s (7 estágios), gracefulRampDown 30s

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 1000ms | 18.6ms | ✅ |
| `http_req_failed` rate | < 5% | 0.00% | ✅ |

**Checks:**

| Check | Resultado |
|-------|-----------|
| search status 200 | ✅ 100% |
| search body array | ✅ 100% |
| detail status 200 ou 404 | ✅ 100% |

**Métricas HTTP:**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| `http_req_duration` | 5.83ms | 464µs | 3.71ms | 79.94ms | 13.02ms | 18.6ms |

**Sumário:**
- Total de requests: **125.400** (596.4/s)
- Iterações completas: 62.700
- Dados recebidos: **1.2 GB** (5.6 MB/s)
- Dados enviados: 11 MB (54 kB/s)
- Duração total: 3m30.3s

---

## 2. Collection

### 2.1 Load Test — `collection-load.js`

**Configuração:**
- 2 cenários: `crud` (150 VUs, 2m) + `listing` (60 VUs, 2m)
- 210 VUs total
- ⚠️ WARN: geradas 200.256 séries temporais únicas (limite sugerido: 100.000)

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 1000ms | 22.29ms | ✅ |
| `http_req_duration{scenario:crud}` p(95) | < 1500ms | 22.92ms | ✅ |
| `http_req_duration{scenario:listing}` p(95) | < 1500ms | 19.2ms | ✅ |
| `http_req_failed` rate | < 1% | 0.00% | ✅ |

**Checks:**

| Check | Resultado |
|-------|-----------|
| register 201 | ✅ 100% |
| login 200 | ✅ 100% |
| setup shelf 201 | ✅ 100% |
| create 201 | ✅ 100% |
| create retorna id | ✅ 100% |
| list 200 | ✅ 100% |
| list é array JSON | ✅ 100% |
| get collection 200 | ✅ 100% |
| add shelf 200 | ✅ 100% |
| remove shelf 200 | ✅ 100% |
| update 200 | ✅ 100% |
| delete 204 | ✅ 100% |

**Métricas HTTP:**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| `http_req_duration` (geral) | 12.13ms | 2.71ms | 10.28ms | 215.45ms | 17.96ms | 22.29ms |
| `{scenario:crud}` | 12.41ms | 2.76ms | 10.7ms | 215.45ms | 18.15ms | 22.92ms |
| `{scenario:listing}` | 11.07ms | 2.71ms | 9.53ms | 203.22ms | 15.58ms | 19.2ms |

**Sumário:**
- Total de requests: **57.092** (430.8/s)
- Iterações completas: 21.152
- Dados recebidos: **28 MB** (214 kB/s)
- Dados enviados: 25 MB (186 kB/s)
- Duração total: 2m12.5s

---

### 2.2 Spike Test — `collection-spike.js`

**Configuração:**
- 1 cenário: rampa até 500 VUs em 50s (5 estágios)
- ⚠️ WARN: 100.659 séries temporais únicas

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 2500ms | 241.76ms | ✅ |
| `http_req_failed` rate | < 5% | 0.00% | ✅ |

**Checks:**

| Check | Resultado |
|-------|-----------|
| list 200 | ✅ 100% |
| list array | ✅ 100% |
| create 201 ou 429 | ✅ 100% |
| add shelf 200 ou 429 | ✅ 100% |

**Métricas HTTP:**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| `http_req_duration` | 60.28ms | 2.73ms | 34.27ms | 614.53ms | 146.74ms | 241.76ms |

**Sumário:**
- Total de requests: **42.620** (568.3/s)
- Iterações completas: 10.280
- Dados recebidos: **20 MB** (267 kB/s)
- Dados enviados: 19 MB (249 kB/s)
- Duração total: 1m15.0s

---

### 2.3 Stress Test — `collection-stress.js`

**Configuração:**
- 1 cenário: rampa até 600 VUs em 4m (8 estágios)
- ⚠️ WARN: 800.053 séries temporais únicas (8× o limite sugerido)

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 2500ms | 309.26ms | ✅ |
| `http_req_failed` rate | < 5% | 0.00% | ✅ |

**Checks:**

| Check | Resultado |
|-------|-----------|
| list 200 | ✅ 100% |
| list array | ✅ 100% |
| create 201 | ✅ 100% |
| get 200 | ✅ 100% |
| add shelf 200 | ✅ 100% |
| remove shelf 200 | ✅ 100% |
| update 200 | ✅ 100% |
| delete 204 | ✅ 100% |

**Métricas HTTP:**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| `http_req_duration` | 89.63ms | 2.72ms | 30.16ms | 1.81s | 225.17ms | 309.26ms |

**Sumário:**
- Total de requests: **154.440** (551.9/s)
- Iterações completas: 21.720
- Dados recebidos: **79 MB** (281 kB/s)
- Dados enviados: 70 MB (249 kB/s)
- Duração total: 4m39.8s

---

## 3. Shelf

### 3.1 Load Test — `shelf-load.js`

**Configuração:**
- 2 cenários: `crud` (150 VUs, 2m) + `listing` (60 VUs, 2m)
- 210 VUs total
- ⚠️ WARN: 200.334 séries temporais únicas

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 1000ms | 44.66ms | ✅ |
| `http_req_duration{scenario:crud}` p(95) | < 1500ms | 48.37ms | ✅ |
| `http_req_duration{scenario:listing}` p(95) | < 1500ms | 33.71ms | ✅ |
| `http_req_failed` rate | < 1% | 0.00% | ✅ |

**Checks:**

| Check | Resultado |
|-------|-----------|
| register 201 | ✅ 100% |
| login 200 | ✅ 100% |
| create 201 | ✅ 100% |
| create retorna id | ✅ 100% |
| list 200 | ✅ 100% |
| list é array JSON | ✅ 100% |
| get shelf 200 | ✅ 100% |
| update 200 | ✅ 100% |
| delete 204 | ✅ 100% |

**Métricas HTTP:**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| `http_req_duration` (geral) | 17.38ms | 2.48ms | 12.7ms | 139.29ms | 32.11ms | 44.66ms |
| `{scenario:crud}` | 18.7ms | 2.62ms | 13.73ms | 139.29ms | 34.79ms | 48.37ms |
| `{scenario:listing}` | 13.79ms | 2.48ms | 10.35ms | 114.18ms | 24.68ms | 33.71ms |

**Sumário:**
- Total de requests: **51.105** (390.4/s)
- Iterações completas: 23.195
- Dados recebidos: **23 MB** (175 kB/s)
- Dados enviados: 21 MB (163 kB/s)
- Duração total: 2m10.9s

---

### 3.2 Spike Test — `shelf-spike.js`

**Configuração:**
- 1 cenário: rampa até 500 VUs em 50s (5 estágios)
- ⚠️ WARN: 100.307 séries temporais únicas

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 2500ms | 76.67ms | ✅ |
| `http_req_failed` rate | < 5% | 0.00% | ✅ |

**Checks:**

| Check | Resultado |
|-------|-----------|
| list 200 | ✅ 100% |
| list array | ✅ 100% |
| create 201 ou 429 | ✅ 100% |

**Métricas HTTP:**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| `http_req_duration` | 34.74ms | 2.4ms | 30.32ms | 202.12ms | 65.92ms | 76.67ms |

**Sumário:**
- Total de requests: **52.186** (716.6/s)
- Iterações completas: 17.062
- Dados recebidos: **22 MB** (301 kB/s)
- Dados enviados: 22 MB (299 kB/s)
- Duração total: 1m12.8s

---

### 3.3 Stress Test — `shelf-stress.js`

**Configuração:**
- 1 cenário: rampa até 600 VUs em 4m (8 estágios)
- ⚠️ WARN: 400.369 séries temporais únicas

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 2500ms | 138.75ms | ✅ |
| `http_req_failed` rate | < 5% | 0.00% | ✅ |

**Checks:**

| Check | Resultado |
|-------|-----------|
| list 200 | ✅ 100% |
| list array | ✅ 100% |
| create 201 | ✅ 100% |
| get 200 | ✅ 100% |
| delete 204 | ✅ 100% |

**Métricas HTTP:**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| `http_req_duration` | 37.92ms | 2.44ms | 14.46ms | 516.23ms | 107.69ms | 138.75ms |

**Sumário:**
- Total de requests: **162.520** (586.1/s)
- Iterações completas: 40.230
- Dados recebidos: **71 MB** (256 kB/s)
- Dados enviados: 68 MB (245 kB/s)
- Duração total: 4m37.3s

---

## 4. ShelfItem

### 4.1 Load Test — `shelfItem-load.js`

**Configuração:**
- 2 cenários: `crud` (150 VUs, 2m) + `listing` (60 VUs, 2m)
- 210 VUs total

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 1000ms | 27.75ms | ✅ |
| `http_req_duration{scenario:crud}` p(95) | < 1500ms | 30.14ms | ✅ |
| `http_req_duration{scenario:listing}` p(95) | < 1500ms | 13.79ms | ✅ |
| `http_req_failed` rate | < 1% | 0.00% | ✅ |

**Checks:**

| Check | Resultado |
|-------|-----------|
| register 201 | ✅ 100% |
| login 200 | ✅ 100% |
| setup shelf 201 | ✅ 100% |
| list items 200 | ✅ 100% |
| list é array JSON | ✅ 100% |
| add item 201 | ✅ 100% |
| add item retorna id | ✅ 100% |
| get item 200 | ✅ 100% |
| update progress 200 | ✅ 100% |
| change status 200 | ✅ 100% |
| remove item 204 | ✅ 100% |

**Métricas HTTP:**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| `http_req_duration` (geral) | 14.22ms | 1.69ms | 13.21ms | 237.42ms | 22.68ms | 27.75ms |
| `{scenario:crud}` | 16.57ms | 3.29ms | 15.24ms | 237.42ms | 24.38ms | 30.14ms |
| `{scenario:listing}` | 7.6ms | 1.69ms | 6.19ms | 225.08ms | 10.33ms | 13.79ms |

**Sumário:**
- Total de requests: **54.660** (413.3/s)
- Iterações completas: 22.170
- Dados recebidos: **27 MB** (206 kB/s)
- Dados enviados: 24 MB (178 kB/s)
- Duração total: 2m12.2s

---

### 4.2 Spike Test — `shelfItem-spike.js`

**Configuração:**
- 1 cenário: rampa até 500 VUs em 50s (5 estágios)

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 2500ms | 238.08ms | ✅ |
| `http_req_failed` rate | < 5% | 0.00% | ✅ |

**Checks:**

| Check | Resultado |
|-------|-----------|
| list items 200 | ✅ 100% |
| list array | ✅ 100% |
| add item 201 ou 429 | ✅ 100% |
| update progress 200 ou 429 | ✅ 100% |

**Métricas HTTP:**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| `http_req_duration` | 123.48ms | 3.23ms | 145.51ms | 530.21ms | 203.87ms | 238.08ms |

**Sumário:**
- Total de requests: **35.920** (428.9/s)
- Iterações completas: 8.605
- Dados recebidos: **18 MB** (210 kB/s)
- Dados enviados: 16 MB (189 kB/s)
- Duração total: 1m23.8s

---

### 4.3 Stress Test — `shelfItem-stress.js`

**Configuração:**
- 1 cenário: rampa até 600 VUs em 4m (8 estágios)

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 3000ms | 337.32ms | ✅ |
| `http_req_failed` rate | < 5% | 0.00% | ✅ |

**Checks:**

| Check | Resultado |
|-------|-----------|
| list items 200 | ✅ 100% |
| list array | ✅ 100% |
| add item 201 | ✅ 100% |
| get item 200 | ✅ 100% |
| update progress 200 | ✅ 100% |
| change status 200 | ✅ 100% |
| remove item 204 | ✅ 100% |

**Métricas HTTP:**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| `http_req_duration` | 118.65ms | 1.94ms | 76.09ms | 1.24s | 287.64ms | 337.32ms |

**Sumário:**
- Total de requests: **139.098** (494.8/s)
- Iterações completas: 22.783
- Dados recebidos: **72 MB** (255 kB/s)
- Dados enviados: 62 MB (221 kB/s)
- Duração total: 4m41.1s

---

## Resumo Geral do DomainBook

| Subdomínio | Teste | VUs máx | Requests | Throughput | p(95) | Falhas | Resultado |
|------------|-------|---------|----------|-----------|-------|--------|-----------|
| book | load | 100 | 14.127 | 116.9/s | 32.51ms | 0% | ✅ |
| book | spike | 300 | 32.884 | 651.6/s | 8.42ms | 0% | ✅ |
| book | stress | 400 | 125.400 | 596.4/s | 18.6ms | 0% | ✅ |
| collection | load | 210 | 57.092 | 430.8/s | 22.29ms | 0% | ✅ |
| collection | spike | 500 | 42.620 | 568.3/s | 241.76ms | 0% | ✅ |
| collection | stress | 600 | 154.440 | 551.9/s | 309.26ms | 0% | ✅ |
| shelf | load | 210 | 51.105 | 390.4/s | 44.66ms | 0% | ✅ |
| shelf | spike | 500 | 52.186 | 716.6/s | 76.67ms | 0% | ✅ |
| shelf | stress | 600 | 162.520 | 586.1/s | 138.75ms | 0% | ✅ |
| shelfItem | load | 210 | 54.660 | 413.3/s | 27.75ms | 0% | ✅ |
| shelfItem | spike | 500 | 35.920 | 428.9/s | 238.08ms | 0% | ✅ |
| shelfItem | stress | 600 | 139.098 | 494.8/s | 337.32ms | 0% | ✅ |

**Total de requests executados no DomainBook:** ~971.052  
**Taxa de falhas geral:** 0%  
**Todos os thresholds:** ✅ aprovados
