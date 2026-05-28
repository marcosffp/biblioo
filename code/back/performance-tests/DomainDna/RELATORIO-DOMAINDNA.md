# Relatório de Performance — DomainDna

> **Data de execução:** 2026-05-28  
> **Ferramenta:** k6 (Grafana)  
> **Ambiente:** localhost:8080  

---

## Subdomínios Testados

| Subdomínio | Arquivos de teste                          | Status              |
|------------|--------------------------------------------|---------------------|
| dna        | dna-load.js, dna-spike.js, dna-stress.js  | ✅ Todos passaram   |

---

## 1. DNA Literário

### 1.1 Load Test — `dna-load.js`

**Configuração:**
- 2 cenários simultâneos: `readDna` (60 VUs, 2m) + `listingDna` (20 VUs, 2m)
- 80 VUs total, duração 2m
- Pool de setup: 100 usuários (register + login + shelf + 5 livros COMPLETED cada)

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 1500ms | 34.08ms | ✅ |
| `http_req_duration{scenario:readDna}` p(95) | < 1500ms | 37.34ms | ✅ |
| `http_req_duration{scenario:listingDna}` p(95) | < 500ms | 29.41ms | ✅ |
| `http_req_failed` rate | < 2% | 0.00% | ✅ |

**Checks:**

| Check | Resultado |
|-------|-----------|
| register 201 | ✅ 100% |
| login 200 | ✅ 100% |
| shelf created 201 | ✅ 100% |
| book added 201 | ✅ 100% |
| get dna 200 | ✅ 100% |
| retorna status ou booksRead | ✅ 100% |
| list dna 200 | ✅ 100% |

**Métricas HTTP:**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| `http_req_duration` (geral) | 19.42ms | 3.31ms | 18.81ms | 75.03ms | 29.54ms | 34.08ms |
| `{scenario:readDna}` | 21.08ms | 3.98ms | 20.37ms | 74.78ms | 31.96ms | 37.34ms |
| `{scenario:listingDna}` | 17.84ms | 3.68ms | 17.95ms | 75.03ms | 25.62ms | 29.41ms |

**Sumário:**
- Total de requests: **12.525** (95.0/s)
- Iterações completas: 11.725
- Dados recebidos: **11 MB** (83 kB/s)
- Dados enviados: 4.4 MB (33 kB/s)
- Duração total: 2m11.8s

---

### 1.2 Spike Test — `dna-spike.js`

**Configuração:**
- 1 cenário: rampa até 300 VUs em 50s (5 estágios), gracefulRampDown 30s
- Pool de setup: 400 usuários

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 1000ms | 19.59ms | ✅ |
| `http_req_failed` rate | < 5% | 0.00% | ✅ |

**Checks:**

| Check | Resultado |
|-------|-----------|
| register 201 | ✅ 100% |
| login 200 | ✅ 100% |
| shelf created 201 | ✅ 100% |
| book added 201 | ✅ 100% |
| get dna 200 ou 429 | ✅ 100% |
| get dna retorna body | ✅ 100% |

**Métricas HTTP:**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| `http_req_duration` | 9.5ms | 2.66ms | 8.74ms | 48.93ms | 13.1ms | 19.59ms |

**Sumário:**
- Total de requests: **19.547** (205.6/s)
- Iterações completas: 16.347
- Dados recebidos: **17 MB** (176 kB/s)
- Dados enviados: 7.0 MB (74 kB/s)
- Duração total: 1m35.1s

---

### 1.3 Stress Test — `dna-stress.js`

**Configuração:**
- 1 cenário: rampa até 500 VUs em 4m (5 estágios), gracefulRampDown 30s
- Pool de setup: 500 usuários

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 2000ms | 16.94ms | ✅ |
| `http_req_failed` rate | < 5% | 0.00% | ✅ |

**Checks:**

| Check | Resultado |
|-------|-----------|
| register 201 | ✅ 100% |
| login 200 | ✅ 100% |
| shelf created 201 | ✅ 100% |
| book added 201 | ✅ 100% |
| get dna 200 | ✅ 100% |
| retorna status ou booksRead | ✅ 100% |

**Métricas HTTP:**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| `http_req_duration` | 9.92ms | 2.8ms | 9.32ms | 75.52ms | 13.51ms | 16.94ms |

**Sumário:**
- Total de requests: **45.157** (150.8/s)
- Iterações completas: 41.157
- Dados recebidos: **39 MB** (131 kB/s)
- Dados enviados: 16 MB (54 kB/s)
- Duração total: 4m59.5s

---

## Resumo Geral do DomainDna

| Subdomínio | Teste  | VUs máx | Requests | Throughput | p(95)   | Falhas | Resultado |
|------------|--------|---------|----------|------------|---------|--------|-----------|
| dna        | load   | 80      | 12.525   | 95.0/s     | 34.08ms | 0%     | ✅ |
| dna        | spike  | 300     | 19.547   | 205.6/s    | 19.59ms | 0%     | ✅ |
| dna        | stress | 500     | 45.157   | 150.8/s    | 16.94ms | 0%     | ✅ |

**Total de requests executados no DomainDna:** ~77.229  
**Taxa de falhas geral:** 0%  
**Todos os thresholds:** ✅ aprovados
