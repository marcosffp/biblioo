# Relatório de Performance — DomainDna

> **Data de execução:** 2026-06-24  
> **Ferramenta:** k6 (Grafana)  
> **Ambiente:** localhost:8080  

---

## Subdomínios Testados

| Subdomínio | Arquivos de teste                          | Status              |
|------------|--------------------------------------------|---------------------|
| dna        | dna-load.js, dna-spike.js, dna-stress.js  | Todos passaram |

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
| `http_req_duration` p(95) | < 1500ms | 45.21ms | Aprovado |
| `http_req_duration{scenario:readDna}` p(95) | < 1500ms | 48.17ms | Aprovado |
| `http_req_duration{scenario:listingDna}` p(95) | < 500ms | 38.2ms | Aprovado |
| `http_req_failed` rate | < 2% | 0.00% | Aprovado |

**Checks:**

| Check | Resultado |
|-------|-----------|
| register 201 | 100% |
| login 200 | 100% |
| shelf created 201 | 100% |
| book added 201 | 100% |
| get dna 200 | 100% |
| retorna status ou booksRead | 100% |
| list dna 200 | 100% |

**Métricas HTTP:**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| `http_req_duration` (geral) | 35.79ms | 3.71ms | 36.83ms | 74.16ms | 40.77ms | 45.21ms |
| `{scenario:readDna}` | 29.25ms | 6.15ms | 29.14ms | 74.16ms | 43.82ms | 48.17ms |
| `{scenario:listingDna}` | 24.91ms | 7.54ms | 25.44ms | 69.01ms | 34.72ms | 38.2ms |

**Sumário:**
- Total de requests: **12.381** (92.87/s)
- Iterações completas: 11.581 (86.86/s)
- Dados recebidos: **11 MB** (81 kB/s)
- Dados enviados: 4.3 MB (33 kB/s)
- Duração total: ~2m13s

---

### 1.2 Spike Test — `dna-spike.js`

**Configuração:**
- 1 cenário: base 50 VUs → pico de 300 VUs em 5s → ramp down (5 estágios: 10s + 5s + 20s + 5s + 10s)
- Pool de setup: 400 usuários

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 1000ms | 58.63ms | Aprovado |
| `http_req_failed` rate | < 5% | 0.00% | Aprovado |

**Checks:**

| Check | Resultado |
|-------|-----------|
| register 201 | 100% |
| login 200 | 100% |
| shelf created 201 | 100% |
| book added 201 | 100% |
| get dna 200 ou 429 | 100% |
| get dna retorna body | 100% |

**Métricas HTTP:**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| `http_req_duration` | 21.33ms | 3.44ms | 14.74ms | 239.58ms | 39.21ms | 58.63ms |

**Sumário:**
- Total de requests: **19.172** (175.84/s)
- Iterações completas: 15.972
- Dados recebidos: **17 MB** (151 kB/s)
- Dados enviados: 6.9 MB (63 kB/s)
- Duração total: 1m49.0s

---

### 1.3 Stress Test — `dna-stress.js`

**Configuração:**
- 1 cenário: estágios crescentes 20 → 100 → 200 → 500 → 0 VUs (30s + 60s + 60s + 60s + 30s)
- Pool de setup: 500 usuários

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 2000ms | 29.88ms | Aprovado |
| `http_req_failed` rate | < 5% | 0.00% | Aprovado |

**Checks:**

| Check | Resultado |
|-------|-----------|
| register 201 | 100% |
| login 200 | 100% |
| shelf created 201 | 100% |
| book added 201 | 100% |
| get dna 200 | 100% |
| retorna status ou booksRead | 100% |

**Métricas HTTP:**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| `http_req_duration` | 15.91ms | 2.99ms | 13.95ms | 84.29ms | 26.78ms | 29.88ms |

**Sumário:**
- Total de requests: **44.899** (150.27/s)
- Iterações completas: 40.899 (136.88/s)
- Dados recebidos: **39 MB** (131 kB/s)
- Dados enviados: 16 MB (54 kB/s)
- Duração total: 4m58.8s

---

## Resumo Geral do DomainDna

| Subdomínio | Teste  | VUs máx | Requests | Throughput | p(95)   | Falhas | Resultado |
|------------|--------|---------|----------|------------|---------|--------|-----------|
| dna        | load   | 80      | 12.381   | 92.87/s    | 45.21ms | 0%     | Aprovado |
| dna        | spike  | 300     | 19.172   | 175.84/s   | 58.63ms | 0%     | Aprovado |
| dna        | stress | 500     | 44.899   | 150.27/s   | 29.88ms | 0%     | Aprovado |

**Total de requests executados no DomainDna:** ~76.827  
**Taxa de falhas geral:** 0%  
**Todos os thresholds:** aprovados
