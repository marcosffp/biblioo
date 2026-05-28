# Relatório de Performance — DomainRecommendation

> **Data de execução:** 2026-05-28  
> **Ferramenta:** k6 (Grafana)  
> **Ambiente:** localhost:8080  

---

## Subdomínios Testados

| Subdomínio    | Arquivos de teste                                                        | Status              |
|---------------|--------------------------------------------------------------------------|---------------------|
| recommendation | recommendation-load.js, recommendation-spike.js, recommendation-stress.js | ✅ Todos passaram |
| roll-dice     | roll-dice-load.js, roll-dice-spike.js, roll-dice-stress.js               | ✅ Todos passaram   |

---

## 1. Recommendation (Motor de Recomendação)

### 1.1 Load Test — `recommendation-load.js`

**Configuração:**
- 1 cenário (`query`): rampa até 500 VUs em 2m (3 estágios), gracefulRampDown 10s
- Pool de setup: 500 usuários
- 6 estratégias de recomendação testadas por iteração: `because-you-read`, `favorite-genre-now`, `trending-in-communities`, `catalog-surprise`, `similar-authors`, `reread-worth-it`

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 1000ms | 727.62ms | ✅ |
| `{name:because-you-read}` p(95) | < 800ms | 726.02ms | ✅ |
| `{name:catalog-surprise}` p(95) | < 1200ms | 728.85ms | ✅ |
| `{name:favorite-genre-now}` p(95) | < 800ms | 727.14ms | ✅ |
| `{name:reread-worth-it}` p(95) | < 800ms | 725.52ms | ✅ |
| `{name:similar-authors}` p(95) | < 1100ms | 731.14ms | ✅ |
| `{name:trending-in-communities}` p(95) | < 900ms | 728.82ms | ✅ |
| `http_req_failed` rate | < 1% | 0.00% | ✅ |

**Checks:**

| Check | Resultado |
|-------|-----------|
| register 201 | ✅ 100% |
| login 200 | ✅ 100% |
| because you read 200 | ✅ 100% |
| because you read tem books | ✅ 100% |
| favorite genre now 200 | ✅ 100% |
| favorite genre now tem topGenres | ✅ 100% |
| favorite genre now tem books | ✅ 100% |
| trending in communities 200 | ✅ 100% |
| trending in communities tem books | ✅ 100% |
| catalog surprise 200 | ✅ 100% |
| catalog surprise tem books | ✅ 100% |
| similar authors 200 | ✅ 100% |
| similar authors tem books | ✅ 100% |
| reread worth it 200 | ✅ 100% |
| reread worth it tem books | ✅ 100% |

**Métricas HTTP por estratégia:**

| Estratégia | avg | min | med | max | p(90) | p(95) |
|------------|-----|-----|-----|-----|-------|-------|
| `http_req_duration` (geral) | 349.53ms | 2.7ms | 290.15ms | 16.32s | 676.83ms | 727.62ms |
| `because-you-read` | 349.19ms | 2.72ms | 290.70ms | 16.32s | 675.66ms | 726.02ms |
| `catalog-surprise` | 351.03ms | 3.35ms | 292.19ms | 15.80s | 677.46ms | 728.85ms |
| `favorite-genre-now` | 349.85ms | 2.71ms | 291.06ms | 15.63s | 675.93ms | 727.14ms |
| `reread-worth-it` | 350.21ms | 2.70ms | 290.21ms | 16.05s | 675.75ms | 725.52ms |
| `similar-authors` | 353.88ms | 3.50ms | 293.70ms | 16.08s | 679.49ms | 731.14ms |
| `trending-in-communities` | 352.42ms | 3.49ms | 292.78ms | 15.75s | 678.90ms | 728.82ms |

**Sumário:**
- Total de requests: **209.445** (1.467/s)
- Iterações completas: 34.738 (243.3/s)
- Dados recebidos: **2.1 GB** (15 MB/s)
- Dados enviados: 83 MB (583 kB/s)
- Duração total: 2m22.8s

---

### 1.2 Spike Test — `recommendation-spike.js`

**Configuração:**
- 1 cenário (`spike`): rampa até 600 VUs em 1m10s (5 estágios), gracefulRampDown 10s
- Pool de setup: 600 usuários
- **Warm-up de cache:** 600 usuários pré-aquecidos antes do início do cenário (600 OK, 0 falhas em ~44s)

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 3000ms | 1.28s | ✅ |
| `{name:because-you-read}` p(95) | < 3000ms | 1.27s | ✅ |
| `{name:catalog-surprise}` p(95) | < 3000ms | 1.28s | ✅ |
| `{name:favorite-genre-now}` p(95) | < 3000ms | 1.27s | ✅ |
| `{name:reread-worth-it}` p(95) | < 3000ms | 1.28s | ✅ |
| `{name:similar-authors}` p(95) | < 3000ms | 1.28s | ✅ |
| `{name:trending-in-communities}` p(95) | < 3000ms | 1.28s | ✅ |
| `http_req_failed` rate | < 5% | 0.00% | ✅ |

**Checks:**

| Check | Resultado |
|-------|-----------|
| (15 checks idênticos ao load) | ✅ 100% todos |

**Métricas HTTP por estratégia:**

| Estratégia | avg | min | med | max | p(90) | p(95) |
|------------|-----|-----|-----|-----|-------|-------|
| `http_req_duration` (geral) | 665.05ms | 2.51ms | 832.13ms | 4.27s | 1.11s | 1.28s |
| `because-you-read` | 667.64ms | 2.53ms | 834.34ms | 3.99s | 1.11s | 1.27s |
| `catalog-surprise` | 670.99ms | 3.05ms | 838.07ms | 4.27s | 1.11s | 1.28s |
| `favorite-genre-now` | 669.83ms | 2.51ms | 835.94ms | 3.44s | 1.11s | 1.27s |
| `reread-worth-it` | 669.04ms | 2.72ms | 835.88ms | 4.08s | 1.11s | 1.28s |
| `similar-authors` | 672.44ms | 3.63ms | 837.35ms | 3.42s | 1.11s | 1.28s |
| `trending-in-communities` | 672.49ms | 3.48ms | 836.02ms | 3.98s | 1.11s | 1.28s |

**Sumário:**
- Total de requests: **144.924** (1.025/s)
- Iterações completas: 23.354 (165.2/s)
- Dados recebidos: **1.5 GB** (11 MB/s)
- Dados enviados: 58 MB (411 kB/s)
- Duração total: 2m21.3s

---

### 1.3 Stress Test — `recommendation-stress.js`

**Configuração:**
- 1 cenário (`stress`): rampa até 400 VUs em 3m30s (6 estágios), gracefulRampDown 10s
- Pool de setup: 600 usuários
- **Warm-up de cache:** 600 usuários pré-aquecidos antes do início do cenário (600 OK, 0 falhas em ~44s)

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 3000ms | 606.1ms | ✅ |
| `{name:because-you-read}` p(95) | < 3000ms | 603.28ms | ✅ |
| `{name:catalog-surprise}` p(95) | < 3000ms | 605.35ms | ✅ |
| `{name:favorite-genre-now}` p(95) | < 3000ms | 604.6ms | ✅ |
| `{name:reread-worth-it}` p(95) | < 3000ms | 604.41ms | ✅ |
| `{name:similar-authors}` p(95) | < 3000ms | 608.16ms | ✅ |
| `{name:trending-in-communities}` p(95) | < 3000ms | 611.86ms | ✅ |
| `http_req_failed` rate | < 10% | 0.00% | ✅ |

**Checks:**

| Check | Resultado |
|-------|-----------|
| (15 checks idênticos ao load) | ✅ 100% todos |

**Métricas HTTP por estratégia:**

| Estratégia | avg | min | med | max | p(90) | p(95) |
|------------|-----|-----|-----|-----|-------|-------|
| `http_req_duration` (geral) | 223.36ms | 2.5ms | 171.62ms | 2.64s | 530.54ms | 606.1ms |
| `because-you-read` | 221.95ms | 2.52ms | 170.87ms | 2.64s | 528.51ms | 603.28ms |
| `catalog-surprise` | 224.23ms | 2.82ms | 174.15ms | 2.46s | 530.97ms | 605.35ms |
| `favorite-genre-now` | 222.24ms | 2.56ms | 171.28ms | 2.46s | 529.34ms | 604.60ms |
| `reread-worth-it` | 221.91ms | 2.50ms | 171.25ms | 2.15s | 529.39ms | 604.41ms |
| `similar-authors` | 225.39ms | 3.23ms | 174.58ms | 2.19s | 532.96ms | 608.16ms |
| `trending-in-communities` | 227.77ms | 3.30ms | 174.44ms | 2.59s | 533.69ms | 611.86ms |

**Sumário:**
- Total de requests: **432.432** (1.534/s)
- Iterações completas: 71.272 (252.9/s)
- Dados recebidos: **4.4 GB** (16 MB/s)
- Dados enviados: 162 MB (573 kB/s)
- Duração total: 4m41.8s

---

## 2. Roll Dice (Recomendação Aleatória)

### 2.1 Load Test — `roll-dice-load.js`

**Configuração:**
- 1 cenário (`rollDice`): 600 VUs constantes por 2m
- Pool de setup: 600 usuários

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration{name:roll-dice}` p(95) | < 2000ms | 21.11ms | ✅ |
| `http_req_failed` rate | < 2% | 0.00% | ✅ |

**Checks:**

| Check | Resultado |
|-------|-----------|
| register 201 | ✅ 100% |
| login 200 | ✅ 100% |
| roll-dice 200 ou 204 | ✅ 100% |
| roll-dice tem id (se 200) | ✅ 100% |

**Métricas HTTP:**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| `http_req_duration` (geral) | 18.71ms | 5.64ms | 13.42ms | 2.47s | 18.81ms | 21.33ms |
| `{name:roll-dice}` | 18.69ms | 5.64ms | 13.41ms | 2.47s | 18.67ms | 21.11ms |

**Sumário:**
- Total de requests: **269.461** (1.819/s)
- Iterações completas: 268.261 (1.811/s)
- Dados recebidos: **416 MB** (2.8 MB/s)
- Dados enviados: 96 MB (647 kB/s)
- Duração total: 2m28.1s

---

### 2.2 Spike Test — `roll-dice-spike.js`

**Configuração:**
- 1 cenário (`rollDiceSpike`): rampa até 600 VUs em 50s (4 estágios), gracefulRampDown 5s
- Pool de setup: 600 usuários

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration{name:roll-dice}` p(95) | < 2500ms | 19.41ms | ✅ |
| `http_req_failed` rate | < 5% | 0.00% | ✅ |

**Checks:**

| Check | Resultado |
|-------|-----------|
| register 201 | ✅ 100% |
| login 200 | ✅ 100% |
| roll-dice 200 ou 204 ou 429 | ✅ 100% |
| roll-dice tem id (se 200) | ✅ 100% |

**Métricas HTTP:**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| `http_req_duration` (geral) | 12.37ms | 3.15ms | 11.49ms | 145.89ms | 17.21ms | 21.37ms |
| `{name:roll-dice}` | 12.15ms | 3.15ms | 11.41ms | 145.89ms | 16.49ms | 19.41ms |

**Sumário:**
- Total de requests: **62.603** (798.8/s)
- Iterações completas: 61.403 (783.5/s)
- Dados recebidos: **96 MB** (1.2 MB/s)
- Dados enviados: 22 MB (285 kB/s)
- Duração total: 1m18.4s

---

### 2.3 Stress Test — `roll-dice-stress.js`

**Configuração:**
- 1 cenário (`rollDiceStress`): rampa até 800 VUs em 4m (4 estágios), gracefulRampDown 10s
- Pool de setup: 800 usuários

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration{name:roll-dice}` p(95) | < 2500ms | 120.32ms | ✅ |
| `http_req_failed` rate | < 5% | 0.00% | ✅ |

**Checks:**

| Check | Resultado |
|-------|-----------|
| register 201 | ✅ 100% |
| login 200 | ✅ 100% |
| roll-dice 200 ou 204 | ✅ 100% |
| roll-dice tem id (se 200) | ✅ 100% |

**Métricas HTTP:**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| `http_req_duration` (geral) | 34.3ms | 3.07ms | 13.27ms | 1.67s | 102.69ms | 120.19ms |
| `{name:roll-dice}` | 34.37ms | 3.07ms | 13.18ms | 1.67s | 102.89ms | 120.32ms |

**Sumário:**
- Total de requests: **254.604** (918.3/s)
- Iterações completas: 253.004 (912.5/s)
- Dados recebidos: **387 MB** (1.4 MB/s)
- Dados enviados: 92 MB (331 kB/s)
- Duração total: 4m37.3s

---

## Resumo Geral do DomainRecommendation

| Subdomínio     | Teste  | VUs máx | Requests | Throughput | p(95)    | Falhas | Resultado |
|----------------|--------|---------|----------|------------|----------|--------|-----------|
| recommendation | load   | 500     | 209.445  | 1.467/s    | 727.62ms | 0%     | ✅ |
| recommendation | spike  | 600     | 144.924  | 1.025/s    | 1.28s    | 0%     | ✅ |
| recommendation | stress | 400     | 432.432  | 1.534/s    | 606.1ms  | 0%     | ✅ |
| roll-dice      | load   | 600     | 269.461  | 1.819/s    | 21.11ms  | 0%     | ✅ |
| roll-dice      | spike  | 600     | 62.603   | 798.8/s    | 19.41ms  | 0%     | ✅ |
| roll-dice      | stress | 800     | 254.604  | 918.3/s    | 120.32ms | 0%     | ✅ |

**Total de requests executados no DomainRecommendation:** ~1.373.469  
**Taxa de falhas geral:** 0%  
**Todos os thresholds:** ✅ aprovados
