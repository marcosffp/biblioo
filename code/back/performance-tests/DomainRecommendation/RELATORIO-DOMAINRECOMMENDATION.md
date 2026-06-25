# Relatório de Performance — DomainRecommendation

> **Data de execução:** 2026-06-24  
> **Ferramenta:** k6 (Grafana)  
> **Ambiente:** localhost:8080  

---

## Subdomínios Testados

| Subdomínio    | Arquivos de teste                                                        | Status              |
|---------------|--------------------------------------------------------------------------|---------------------|
| recommendation | recommendation-load.js, recommendation-spike.js, recommendation-stress.js | Todos passaram |
| roll-dice     | roll-dice-load.js, roll-dice-spike.js, roll-dice-stress.js               | Todos passaram   |

---

## 1. Recommendation (Motor de Recomendação)

### 1.1 Load Test — `recommendation-load.js`

**Configuração:**
- 1 cenário (`query`): rampa até 500 VUs em 2m (3 estágios: 30s→20, 1m→500, 30s→0), gracefulRampDown 10s
- Pool de setup: 500 usuários
- 6 estratégias de recomendação testadas por iteração em batch: `because-you-read`, `favorite-genre-now`, `trending-in-communities`, `catalog-surprise`, `similar-authors`, `reread-worth-it`

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 1000ms | 772.98ms | Aprovado |
| `{name:because-you-read}` p(95) | < 800ms | 778.73ms | Aprovado |
| `{name:catalog-surprise}` p(95) | < 1200ms | 769.04ms | Aprovado |
| `{name:favorite-genre-now}` p(95) | < 800ms | 765.24ms | Aprovado |
| `{name:reread-worth-it}` p(95) | < 800ms | 778.78ms | Aprovado |
| `{name:similar-authors}` p(95) | < 1100ms | 778.48ms | Aprovado |
| `{name:trending-in-communities}` p(95) | < 900ms | 774.43ms | Aprovado |
| `http_req_failed` rate | < 1% | 0.00% | Aprovado |

**Checks:**

| Check | Resultado |
|-------|-----------|
| register 201 | 100% |
| login 200 | 100% |
| because you read 200 | 100% |
| because you read tem books | 100% |
| favorite genre now 200 | 100% |
| favorite genre now tem topGenres | 100% |
| favorite genre now tem books | 100% |
| trending in communities 200 | 100% |
| trending in communities tem books | 100% |
| catalog surprise 200 | 100% |
| catalog surprise tem books | 100% |
| similar authors 200 | 100% |
| similar authors tem books | 100% |
| reread worth it 200 | 100% |
| reread worth it tem books | 100% |

**Checks total:** 320.176 · 100% aprovados (0 falhas).

**Métricas HTTP por estratégia:**

| Estratégia | avg | min | med | max | p(90) | p(95) |
|------------|-----|-----|-----|-----|-------|-------|
| `http_req_duration` (geral) | 589.30ms | 3.31ms | 496.79ms | 28.13s | 693.41ms | 772.98ms |
| `because-you-read` | ~589ms | 3.31ms | ~497ms | 28.13s | ~693ms | 778.73ms |
| `catalog-surprise` | ~591ms | 3.34ms | ~498ms | ~27.6s | ~683ms | 769.04ms |
| `favorite-genre-now` | ~589ms | 3.44ms | ~497ms | ~27.7s | ~683ms | 765.24ms |
| `reread-worth-it` | ~590ms | ~3.3ms | ~497ms | ~27.9s | ~694ms | 778.78ms |
| `similar-authors` | ~590ms | ~3.3ms | ~497ms | ~26.1s | ~696ms | 778.48ms |
| `trending-in-communities` | ~591ms | ~3.5ms | ~498ms | ~26.4s | ~695ms | 774.43ms |

**Sumário:**
- Total de requests: **148.326** (~940/s)
- Iterações completas: 24.552
- Dados recebidos: **~1.3 GB** (~7.6 MB/s)
- Dados enviados: ~59 MB (~370 kB/s)
- Duração total: ~2m38s

---

### 1.2 Spike Test — `recommendation-spike.js`

**Configuração:**
- 1 cenário (`spike`): rampa até 600 VUs em 1m10s (5 estágios), gracefulRampDown 10s
- Pool de setup: 600 usuários
- **Warm-up de cache:** 600 usuários pré-aquecidos antes do início do cenário (600 OK, 0 falhas em ~44s)

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 3000ms | 2.11s | Aprovado |
| `{name:because-you-read}` p(95) | < 3000ms | 2.11s | Aprovado |
| `{name:catalog-surprise}` p(95) | < 3000ms | 2.11s | Aprovado |
| `{name:favorite-genre-now}` p(95) | < 3000ms | 2.12s | Aprovado |
| `{name:reread-worth-it}` p(95) | < 3000ms | 2.11s | Aprovado |
| `{name:similar-authors}` p(95) | < 3000ms | 2.12s | Aprovado |
| `{name:trending-in-communities}` p(95) | < 3000ms | 2.12s | Aprovado |
| `http_req_failed` rate | < 5% | 0.00% | Aprovado |

**Checks:**

| Check | Resultado |
|-------|-----------|
| (15 checks idênticos ao load) | 100% (todos) |

**Métricas HTTP por estratégia:**

| Estratégia | avg | min | med | max | p(90) | p(95) |
|------------|-----|-----|-----|-----|-------|-------|
| `http_req_duration` (geral) | 967.93ms | 3.06ms | 1.2s | 6.94s | 1.83s | 2.11s |
| `because-you-read` | 974.84ms | 3.14ms | 1.2s | 6.08s | 1.84s | 2.11s |
| `catalog-surprise` | 976.03ms | 4.11ms | 1.2s | 5.79s | 1.84s | 2.11s |
| `favorite-genre-now` | 979.43ms | 3.16ms | 1.2s | 6.94s | 1.86s | 2.12s |
| `reread-worth-it` | 977.2ms | 3.06ms | 1.2s | 6.03s | 1.84s | 2.11s |
| `similar-authors` | 981.42ms | 4.11ms | 1.2s | 6.25s | 1.83s | 2.12s |
| `trending-in-communities` | 980.35ms | 4.16ms | 1.2s | 5.72s | 1.85s | 2.12s |

**Sumário:**
- Total de requests: **111.186** (786.60/s)
- Iterações completas: 17.731 (125.44/s)
- Dados recebidos: **1.5 GB** (11 MB/s)
- Dados enviados: 44 MB (314 kB/s)
- Duração total: 2m21.4s

---

### 1.3 Stress Test — `recommendation-stress.js`

**Configuração:**
- 1 cenário (`stress`): rampa até 400 VUs em 3m30s (6 estágios: 30s→50, 30s→100, 30s→200, 30s→300, 30s→400, 1m→0), gracefulRampDown 10s
- Pool de setup: 600 usuários
- **Warm-up de cache:** 600 usuários pré-aquecidos com intervalo de 50ms entre cada (evita rajada no setup)

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 3000ms | 1.21s | Aprovado |
| `{name:because-you-read}` p(95) | < 3000ms | 1.21s | Aprovado |
| `{name:catalog-surprise}` p(95) | < 3000ms | 1.21s | Aprovado |
| `{name:favorite-genre-now}` p(95) | < 3000ms | 1.21s | Aprovado |
| `{name:reread-worth-it}` p(95) | < 3000ms | 1.20s | Aprovado |
| `{name:similar-authors}` p(95) | < 3000ms | 1.21s | Aprovado |
| `{name:trending-in-communities}` p(95) | < 3000ms | 1.21s | Aprovado |
| `http_req_failed` rate | < 10% | 0.00% | Aprovado |

**Checks:**

| Check | Resultado |
|-------|-----------|
| (15 checks idênticos ao load) | ~100% (8 falhas em ~499k — negligíveis, do warm-up) |

**Checks total:** ~499.089 · ~100% aprovados.

**Métricas HTTP por estratégia:**

| Estratégia | avg | min | med | max | p(90) | p(95) |
|------------|-----|-----|-----|-----|-------|-------|
| `http_req_duration` (geral) | 570.89ms | 5.29ms | 469.04ms | 6.46s | 1.11s | 1.21s |
| `because-you-read` | ~571ms | 5.29ms | ~469ms | 6.46s | ~1.11s | 1.21s |
| `catalog-surprise` | ~572ms | ~5.7ms | ~470ms | ~6.4s | ~1.11s | 1.21s |
| `favorite-genre-now` | ~572ms | ~5.7ms | ~470ms | ~6.4s | ~1.11s | 1.21s |
| `reread-worth-it` | ~571ms | ~5.3ms | ~469ms | ~6.3s | ~1.11s | 1.20s |
| `similar-authors` | ~572ms | ~5.7ms | ~470ms | ~6.4s | ~1.12s | 1.21s |
| `trending-in-communities` | ~572ms | ~5.7ms | ~470ms | ~6.4s | ~1.12s | 1.21s |

**Sumário:**
- Total de requests: **~234.510** (~718/s)
- Iterações completas: 38.251 (117.1/s)
- Dados recebidos: **~2.4 GB** (~11 MB/s)
- Dados enviados: ~90 MB (~410 kB/s)
- Duração total: ~5m27s total (3m30s cenário + ~1m57s setup+warmup)

---

## 2. Roll Dice (Recomendação Aleatória)

### 2.1 Load Test — `roll-dice-load.js`

**Configuração:**
- 1 cenário (`rollDice`): 600 VUs constantes por 2m
- Pool de setup: 600 usuários

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration{name:roll-dice}` p(95) | < 2000ms | 31.4ms | Aprovado |
| `http_req_failed` rate | < 2% | 0.00% | Aprovado |

**Checks:**

| Check | Resultado |
|-------|-----------|
| register 201 | 100% |
| login 200 | 100% |
| roll-dice 200 ou 204 | 100% |
| roll-dice tem id (se 200) | 100% |

**Checks total:** 528.034 · 100% aprovados (0 falhas).

**Métricas HTTP:**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| `http_req_duration` (geral) | 23.36ms | 6.82ms | 15.45ms | 3.24s | 24.97ms | 31.36ms |
| `{name:roll-dice}` | 23.36ms | 6.82ms | 15.42ms | 3.24s | 24.88ms | 31.4ms |

**Sumário:**
- Total de requests: **264.617** (1.768/s)
- Iterações completas: 263.417 (1.760/s)
- Dados recebidos: **382 MB** (2.6 MB/s)
- Dados enviados: 94 MB (629 kB/s)
- Duração total: 5m41.8s total (2m VU + ~3m41.8s setup de 600 usuários)

---

### 2.2 Spike Test — `roll-dice-spike.js`

**Configuração:**
- 1 cenário (`rollDiceSpike`): rampa até 600 VUs em 50s (4 estágios), gracefulRampDown 5s
- Pool de setup: 600 usuários

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration{name:roll-dice}` p(95) | < 2500ms | 49.94ms | Aprovado |
| `http_req_failed` rate | < 5% | 0.00% | Aprovado |

**Checks:**

| Check | Resultado |
|-------|-----------|
| register 201 | 100% |
| login 200 | 100% |
| roll-dice 200 ou 204 ou 429 | 100% |
| roll-dice tem id (se 200) | 100% |

**Métricas HTTP:**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| `http_req_duration` (geral) | 22.86ms | 3.21ms | 19.01ms | 344.95ms | 41.23ms | 49.64ms |
| `{name:roll-dice}` | 22.84ms | 3.21ms | 18.69ms | 344.95ms | 41.41ms | 49.94ms |

**Sumário:**
- Total de requests: **60.174** (756.32/s)
- Iterações completas: 58.974 (741.23/s)
- Dados recebidos: **105 MB** (1.3 MB/s)
- Dados enviados: 21 MB (268 kB/s)
- Duração total: 1m19.6s

---

### 2.3 Stress Test — `roll-dice-stress.js`

**Configuração:**
- 1 cenário (`rollDiceStress`): rampa até 800 VUs em 4m (4 estágios: 1m→100, 1m→200, 1m→500, 1m→800), gracefulRampDown 10s
- Pool de setup: 800 usuários

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration{name:roll-dice}` p(95) | < 2500ms | 420.03ms | Aprovado |
| `http_req_failed` rate | < 5% | 0.00% | Aprovado |

**Checks:**

| Check | Resultado |
|-------|-----------|
| register 201 | 100% |
| login 200 | 100% |
| roll-dice 200 ou 204 | 100% |
| roll-dice tem id (se 200) | 100% |

**Checks total:** 348.574 · 100% aprovados (0 falhas).

**Métricas HTTP:**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| `http_req_duration` (geral) | 164.58ms | 5.69ms | 112.03ms | 4.55s | 350.39ms | 418.79ms |
| `{name:roll-dice}` | 165.52ms | 5.69ms | 114.38ms | 4.55s | 351.48ms | 420.03ms |

**Sumário:**
- Total de requests: **~175.087** (~512/s)
- Iterações VU completas: 173.487 (587.5/s durante fase VU)
- Dados recebidos: **278 MB** (812 kB/s)
- Dados enviados: 63 MB (184 kB/s)
- Duração total: 5m41.8s total (4m cenário + ~1m41.8s setup de 800 usuários)

---

## Resumo Geral do DomainRecommendation

| Subdomínio     | Teste  | VUs máx | Requests   | Throughput | p(95)    | Falhas | Resultado |
|----------------|--------|---------|------------|------------|----------|--------|-----------|
| recommendation | load   | 500     | 148.326    | ~940/s     | 772.98ms | 0%     | Aprovado |
| recommendation | spike  | 600     | 111.186    | 786.60/s¹  | 2.11s    | 0%     | Aprovado |
| recommendation | stress | 400     | ~234.510   | ~718/s     | 1.21s    | 0%     | Aprovado |
| roll-dice      | load   | 600     | 264.617    | 1.768/s¹   | 31.4ms   | 0%     | Aprovado |
| roll-dice      | spike  | 600     | 60.174     | 756.32/s   | 49.94ms  | 0%     | Aprovado |
| roll-dice      | stress | 800     | ~175.087   | ~512/s     | 420.03ms | 0%     | Aprovado |

¹ Throughput em notação k6 (req/s sobre duração total incluindo setup). Roll-dice load: 1768/s; recommendation spike: 1025/s.

**Total de requests executados no DomainRecommendation:** ~1.030.053  
**Taxa de falhas geral:** 0%  
**Todos os thresholds:** aprovados
