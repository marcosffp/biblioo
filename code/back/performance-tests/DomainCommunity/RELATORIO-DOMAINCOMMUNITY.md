# Relatório de Performance — DomainCommunity

> **Data de execução:** 2026-05-28  
> **Ferramenta:** k6 (Grafana)  
> **Ambiente:** localhost:8080  

---

## Subdomínios e Status

| Subdomínio       | Arquivos rodados                                                                                             | Status           |
|------------------|--------------------------------------------------------------------------------------------------------------|------------------|
| community        | community-load, community-spike, community-stress, community-invites-load, community-invites-stress, community-join-requests-load, community-join-requests-stress | ✅/⚠️ Ver detalhes |
| community (manage) | community-manage-stress                                                                                    | ❌ Não executado  |
| message (WS)     | message-load, message-spike, message-stress, message-concurrency                                             | ❌ Não executado  |
| messageRest      | messageRest-load, messageRest-spike, messageRest-stress                                                      | ❌ Não executado  |
| voting           | voting-load, voting-spike, voting-stress                                                                     | ❌ Não executado  |

---

## 1. Community

### 1.1 Load Test — `community-load.js`

**Configuração:**
- 4 cenários simultâneos: `leaveJoin` (15 VUs) + `manage` (15 VUs) + `members` (20 VUs) + `read` (40 VUs)
- 90 VUs total, duração 2m

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 1000ms | 15.43ms | ✅ |
| `http_req_duration{scenario:leaveJoin}` p(95) | < 1500ms | 20.54ms | ✅ |
| `http_req_duration{scenario:manage}` p(95) | < 2000ms | 14.45ms | ✅ |
| `http_req_duration{scenario:members}` p(95) | < 800ms | 13.64ms | ✅ |
| `http_req_duration{scenario:read}` p(95) | < 500ms | 11.51ms | ✅ |
| `http_req_failed` rate | < 1% | 0.00% | ✅ |

**Checks:**

| Check | Resultado |
|-------|-----------|
| owner register 201 | ✅ 100% |
| owner login 200 | ✅ 100% |
| create community 201 | ✅ 100% |
| register 201 | ✅ 100% |
| login 200 | ✅ 100% |
| join 204 | ✅ 100% |
| create 201 | ✅ 100% |
| create retorna id | ✅ 100% |
| GET /communities 200 | ✅ 100% |
| leave 204 ou 4xx | ✅ 100% |
| GET members 200 | ✅ 100% |
| GET community 200 | ✅ 100% |
| GET /communities/{id} 200 | ✅ 100% |
| join 204 ou 4xx | ✅ 100% |
| GET /mine 200 | ✅ 100% |
| update 200 | ✅ 100% |
| GET /book/{bookId} 200 | ✅ 100% |
| delete 204 | ✅ 100% |

**Métricas HTTP:**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| `http_req_duration` (geral) | 8.85ms | 2.1ms | 7.4ms | 133.8ms | 13.42ms | 15.43ms |
| `{scenario:leaveJoin}` | 13.73ms | 5.66ms | 12.6ms | 108.31ms | 17.65ms | 20.54ms |
| `{scenario:manage}` | 9.52ms | 2.68ms | 9.34ms | 100.92ms | 12.75ms | 14.45ms |
| `{scenario:members}` | 8.35ms | 2.95ms | 6.89ms | 107.42ms | 12.14ms | 13.64ms |
| `{scenario:read}` | 7.35ms | 2.1ms | 6.53ms | 99.44ms | 10.03ms | 11.51ms |

**Sumário:**
- Total de requests: **25.322** (192.6/s)
- Iterações completas: 10.355
- Dados recebidos: **37 MB** (284 kB/s)
- Dados enviados: 9.6 MB (73 kB/s)
- Duração total: 2m11.5s

---

### 1.2 Spike Test — `community-spike.js`

**Configuração:**
- 1 cenário: rampa até 200 VUs em 50s (5 estágios)

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 2000ms | 13.9ms | ✅ |
| `http_req_failed` rate | < 5% | 0.00% | ✅ |

**Checks:**

| Check | Resultado |
|-------|-----------|
| owner register 201 | ✅ 100% |
| owner login 200 | ✅ 100% |
| create community 201 | ✅ 100% |
| register 201 | ✅ 100% |
| login 200 | ✅ 100% |
| GET /communities 200 | ✅ 100% |
| GET /communities/{id} 200 | ✅ 100% |

**Métricas HTTP:**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| `http_req_duration` | 7.53ms | 2.13ms | 6.96ms | 41.87ms | 10.99ms | 13.9ms |

**Sumário:**
- Total de requests: **13.672** (258.4/s)
- Iterações completas: 6.780
- Dados recebidos: **20 MB** (386 kB/s)
- Dados enviados: 5.0 MB (94 kB/s)
- Duração total: 52.9s

---

### 1.3 Stress Test — `community-stress.js`

**Configuração:**
- 1 cenário: rampa até 500 VUs em 3m30s (7 estágios)

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 5000ms | 47.95ms | ✅ |
| `http_req_failed` rate | < 10% | 0.00% | ✅ |

**Checks:**

| Check | Resultado |
|-------|-----------|
| owner register 201 | ✅ 100% |
| owner login 200 | ✅ 100% |
| create community 201 | ✅ 100% |
| register 201 | ✅ 100% |
| login 200 | ✅ 100% |
| GET /communities 200 | ✅ 100% |
| GET /communities/{id} 200 | ✅ 100% |

**Métricas HTTP:**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| `http_req_duration` | 14.23ms | 1.87ms | 7.99ms | 194.3ms | 32.95ms | 47.95ms |

**Sumário:**
- Total de requests: **213.847** (995.2/s)
- Iterações completas: 106.815
- Dados recebidos: **321 MB** (1.5 MB/s)
- Dados enviados: 79 MB (365 kB/s)
- Duração total: 3m34.9s

---

### 1.4 Invites Load Test — `community-invites-load.js`

**Configuração:**
- 2 cenários: `invite` (1 VU, 2m) + `listPending` (1 VU, 2m)
- 2 VUs total (cenário de baixa carga intencional)

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 1500ms | 27.88ms | ✅ |
| `http_req_duration{scenario:invite}` p(95) | < 2000ms | 32.05ms | ✅ |
| `http_req_duration{scenario:listPending}` p(95) | < 1500ms | 13.69ms | ✅ |
| `http_req_failed` rate | < 5% | 0.00% | ✅ |

**Checks:**

| Check | Resultado |
|-------|-----------|
| owner register 201 | ✅ 100% |
| owner login 200 | ✅ 100% |
| create community 201 | ✅ 100% |
| invitee register 201 | ✅ 100% |
| invitee login 200 | ✅ 100% |
| GET /invites/pending 200 | ✅ 100% |
| invite 201 ou conflito | ✅ 100% |
| decline 204 | ✅ 100% |

**Métricas HTTP:**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| `http_req_duration` (geral) | 18.76ms | 3.55ms | 20.51ms | 38.39ms | 25.58ms | 27.88ms |
| `{scenario:invite}` | 19.27ms | 6.09ms | 18.13ms | 37.55ms | 29.54ms | 32.05ms |
| `{scenario:listPending}` | 9.85ms | 3.55ms | 10.39ms | 17.26ms | 12.68ms | 13.69ms |

**Sumário:**
- Total de requests: **1.010** (7.7/s)
- Iterações completas: 339
- Dados recebidos: **673 kB** (5.1 kB/s)
- Dados enviados: 322 kB (2.5 kB/s)
- Duração total: 2m11.5s

---

### 1.5 Invites Stress Test — `community-invites-stress.js`

**Configuração:**
- 1 cenário: rampa até 600 VUs em 4m (8 estágios)
- ⚠️ WARN: 400.192 séries temporais únicas

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 5000ms | 319.35ms | ✅ |
| `http_req_failed` rate | < 30% | 8.06% | ✅ |

> ⚠️ **Nota:** Taxa de falha de **8.06%** (12.667 requests) — aprovada pelo threshold permissivo de 30%, mas representa falhas reais de negócio (conflitos de convite, usuário já membro). Veja OBSERVACOES.md.

**Checks:**

| Check | Resultado |
|-------|-----------|
| owner register 201 | ✅ 100% |
| owner login 200 | ✅ 100% |
| create community 201 | ✅ 100% |
| invitee register 201 | ✅ 100% |
| invitee login 200 | ✅ 100% |
| invite 201 ou conflito | ✅ 100% |
| GET /invites/pending 200 | ✅ 100% |
| decline 204 ou conflito | ✅ 100% |

**Métricas HTTP:**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| `http_req_duration` | 84.33ms | 1.94ms | 27.99ms | 1.19s | 239.73ms | 319.35ms |
| `{ expected_response:true }` | 81.11ms | 1.94ms | 24.62ms | 1.19s | 236.54ms | 321.11ms |

**Sumário:**
- Total de requests: **157.086** (567.6/s)
- Falhas HTTP: **12.667 (8.06%)**
- Iterações completas: 52.593
- Dados recebidos: **72 MB** (261 kB/s)
- Dados enviados: 65 MB (234 kB/s)
- Duração total: 4m36.8s

---

### 1.6 Join Requests Load Test — `community-join-requests-load.js`

**Configuração:**
- 2 cenários: `listPending` (60 VUs) + `request` (150 VUs)
- 210 VUs total, duração 2m

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 1500ms | 121.11ms | ✅ |
| `http_req_duration{scenario:listPending}` p(95) | < 800ms | 160.85ms | ✅ |
| `http_req_duration{scenario:request}` p(95) | < 2000ms | 111.25ms | ✅ |
| `http_req_failed` rate | < 5% | **31.19%** | ❌ |

> **THRESHOLD VIOLADO:** Taxa de falha HTTP de **31.19%** — 17.952 de 57.539 requests falharam. O k6 finalizou com `ERRO: thresholds on metrics 'http_req_failed' have been crossed`.

**Checks:**

| Check | Resultado |
|-------|-----------|
| owner register 201 | ✅ 100% |
| owner login 200 | ✅ 100% |
| create community 201 | ✅ 100% |
| requester register 201 | ✅ 100% |
| requester login 200 | ✅ 100% |
| request 201 ou conflito | ✅ 100% |
| GET /join-requests 200 | ✅ 100% |
| **reject 204** | **❌ 30% sucesso (4.483/14.850)** |

**Métricas HTTP:**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| `http_req_duration` (geral) | 47.76ms | 2.02ms | 35.03ms | 956.43ms | 89.48ms | 121.11ms |
| `{ expected_response:true }` | 62.88ms | 3.62ms | 52.53ms | 956.43ms | 102.46ms | 142.82ms |
| `{scenario:listPending}` | 78.98ms | 16.68ms | 58.54ms | 888.33ms | 111.51ms | 160.85ms |
| `{scenario:request}` | 39.33ms | 2.02ms | 17.45ms | 956.43ms | 81.4ms | 111.25ms |

**Sumário:**
- Total de requests: **57.539** (433.8/s)
- Falhas HTTP: **17.952 (31.19%)**
- Checks falhos: **18.01%** (10.367 de 57.539)
- Iterações completas: 27.319
- Dados recebidos: **66 MB** (498 kB/s)
- Dados enviados: 23 MB (175 kB/s)
- Duração total: 2m12.6s

---

### 1.7 Join Requests Stress Test — `community-join-requests-stress.js`

**Configuração:**
- 1 cenário: rampa até 600 VUs em 4m (8 estágios)
- ⚠️ WARN: 200.104 séries temporais únicas

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 5000ms | 997.23ms | ✅ |
| `http_req_failed` rate | < 40% | 19.19% | ✅ |

> ⚠️ **Nota:** Taxa de falha de **19.19%** — aprovada pelo threshold permissivo de 40%, mas são falhas reais de concorrência. Threshold ajustado para acomodar o comportamento do teste anterior. Veja OBSERVACOES.md.

**Checks:**

| Check | Resultado |
|-------|-----------|
| owner register 201 | ✅ 100% |
| owner login 200 | ✅ 100% |
| create community 201 | ✅ 100% |
| requester register 201 | ✅ 100% |
| requester login 200 | ✅ 100% |
| request 201 ou conflito | ✅ 100% |
| GET /join-requests 200 | ✅ 100% |
| reject 204 ou conflito | ✅ 100% |

**Métricas HTTP:**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| `http_req_duration` | 190.93ms | 2.28ms | 54.39ms | 3.21s | 487.68ms | 997.23ms |
| `{ expected_response:true }` | 204.75ms | 3.17ms | 47.42ms | 3.21s | 628.51ms | 1.11s |

**Sumário:**
- Total de requests: **106.399** (381.5/s)
- Falhas HTTP: **20.418 (19.19%)**
- Iterações completas: 34.883
- Dados recebidos: **85 MB** (306 kB/s)
- Dados enviados: 43 MB (155 kB/s)
- Duração total: 4m38.9s

---

## Resumo Geral do DomainCommunity

| Subdomínio | Teste | VUs máx | Requests | Throughput | p(95) | Falhas HTTP | Resultado |
|------------|-------|---------|----------|-----------|-------|-------------|-----------|
| community | load | 90 | 25.322 | 192.6/s | 15.43ms | 0% | ✅ |
| community | spike | 200 | 13.672 | 258.4/s | 13.9ms | 0% | ✅ |
| community | stress | 500 | 213.847 | 995.2/s | 47.95ms | 0% | ✅ |
| community-invites | load | 2 | 1.010 | 7.7/s | 27.88ms | 0% | ✅ |
| community-invites | stress | 600 | 157.086 | 567.6/s | 319.35ms | 8.06% | ⚠️ |
| community-join-requests | load | 210 | 57.539 | 433.8/s | 121.11ms | 31.19% | ❌ |
| community-join-requests | stress | 600 | 106.399 | 381.5/s | 997.23ms | 19.19% | ⚠️ |
| community-manage | stress | — | — | — | — | — | ❌ Não executado |
| message (WS) | load/spike/stress/concurrency | — | — | — | — | — | ❌ Não executado |
| messageRest | load/spike/stress | — | — | — | — | — | ❌ Não executado |
| voting | load/spike/stress | — | — | — | — | — | ❌ Não executado |

**Total de requests executados no DomainCommunity (parcial):** ~574.875  
**Testes com threshold violado:** 1 (join-requests load)  
**Testes com taxa de falha elevada mas dentro do threshold:** 2 (invites stress, join-requests stress)
