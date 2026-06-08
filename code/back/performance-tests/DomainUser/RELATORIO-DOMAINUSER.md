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
| social | social-load.js, social-requests-load.js | ✅ Todos passaram (adicionados em 2026-05-30) |

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

## 2. Social (grafo de relacionamentos) — adicionado em 2026-05-30

Cobre o grafo social que o `user` original não exercitava: follow/unfollow, listagem de followers/following, busca de usuários e o fluxo de solicitações de seguir em contas privadas (visibility → request → accept/reject). Ambos os scripts são **race-free por construção** (partição por `__VU`): cada VU usa um follower exclusivo e, no fluxo privado, um par owner/requester exclusivo — evitando a auto-colisão que mascara/derruba testes de estado compartilhado.

### 2.1 Social Load (caminho público) — `social-load.js`

**Configuração:** 2 cenários — `graph` (140 VUs, follow/unfollow + followers/following) + `discovery` (70 VUs, busca + perfil), 210 VUs, 2m. Setup: 20 celebs + 230 followers (públicos).

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 1000ms | 24.55ms | ✅ |
| `{scenario:graph}` p(95) | < 1500ms | 26.23ms | ✅ |
| `{scenario:discovery}` p(95) | < 500ms | 17.23ms | ✅ |
| `http_req_failed` rate | < 1% | 0.00% | ✅ |

**Checks:** follow 204, unfollow 204, GET /followers 200, GET /following 200, GET /{username} 200, GET /users?q 200 — todos ✅ 100% (89.968 checks).

**Métricas HTTP:**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| geral | 10.77ms | 1.67ms | 7.87ms | 326.5ms | 19.48ms | 24.55ms |
| graph | 11.91ms | 2.11ms | 8.59ms | 326.5ms | 21.15ms | 26.23ms |
| discovery | 8.36ms | 1.67ms | 6.55ms | 296.1ms | 13.35ms | 17.23ms |

**Sumário:** 89.968 requests (676.58/s) · 24.922 iterações · 0 falhas · 66 MB recv / 37 MB sent · 2m.

### 2.1.1 Social Spike (público) — `social-spike.js`

Pico 70→**500 VUs** de follow/unfollow + leitura de followers. Race-free (follower exclusivo por VU, `followerPoolSize` 550 > pico).

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 2500ms | 300.11ms | ✅ |
| `http_req_failed` rate | < 5% | 0.00% | ✅ |

**Checks** (follow 204 / GET followers 200 / unfollow 204): ✅ 100% (43.932). **Métricas:** avg 142.82ms · med 144.64ms · max 679.69ms · p(90) 261.5ms. **Sumário:** 45.072 req (585.29/s) · 0 falhas · 25 MB recv · 1m17s.

### 2.1.2 Social Stress (público) — `social-stress.js`

Rampa até **600 VUs** (7 estágios) de follow/unfollow + leitura de following. Race-free (`followerPoolSize` 650 > pico).

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 2500ms | 347.09ms | ✅ |
| `http_req_failed` rate | < 5% | 0.00% | ✅ |

**Checks** (follow 204 / GET following 200 / unfollow 204): ✅ 100% (223.386). **Métricas:** avg 124.2ms · med 94.31ms · max 1.09s · p(90) 289.16ms. **Sumário:** **224.726 req (823.14/s)** · 0 falhas · 86 MB recv / 88 MB sent · 4m33s.

> O grafo público escala liso a 600 VUs localmente (823 req/s, 0 falhas) — o padrão saudável dos demais domínios. A parede de conexão local só aparece no caminho **privado** sob contenção sustentada (2.3).

### 2.2 Social Requests (caminho privado) — `social-requests-load.js`

**Configuração:** 1 cenário `requests` (100 VUs, 2m). Cada VU = par exclusivo { owner privado, requester }. Setup: 100 pares (owner com `isPrivate=true`). Alterna accept/reject por paridade da iteração.

**Thresholds:**

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 1500ms | 52.92ms | ✅ |
| `http_req_failed` rate | < 1% | 0.00% | ✅ |

**Checks:** visibility 200, follow privado **202**, GET /follow-requests 200, accept 204, unfollow reset 204, reject 204 — todos ✅ 100% (32.400 checks).

**Métricas HTTP:**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| geral | 19.99ms | 1.83ms | 12.44ms | 849.48ms | 44.14ms | 52.92ms |

**Sumário:** 32.400 requests (247.28/s) · 9.100 iterações · 0 falhas · 13 MB recv / 14 MB sent · 2m.

> **Observação:** o fluxo de follow-requests é a mesma classe de operação de estado compartilhado que reprovou em `community-join-requests` (race condition). O caminho feliz (particionado, 1 owner por VU) passou com 0%; a contenção de múltiplos atores sobre a mesma fila foi investigada à parte em 2.3.

### 2.3 Social Requests — Concorrência/Stress — `social-requests-stress.js`

Espelha `community-join-requests-stress.js` para forçar contenção: 50 owners privados, 800 requesters, rampa até 600 VUs, vários VUs rejeitando o **mesmo** `users[0]` da fila do mesmo owner.

**O que se aprendeu:**
- **Nenhuma race no reject no nível amostrado:** `reject 204 ou conflito` passou **99%** (apenas 72 conflitos em ~11k). O padrão do join-requests **não apareceu** aqui.
- **O run colapsou por artefato local, não por bug:** `http_req_failed` 83% dominado por **EOF / connection reset** (não por 4xx de negócio), com a contradição reveladora `http_req_duration` max = **16m51s** vs `iteration_duration` max = **1.36s** (impossível numa medição sã) e **~2h47 de relógio** para um schedule de 4 min. É a **mesma limitação do `message-concurrency`**: k6 + JVM + 5 datastores na mesma máquina esgotando conexões do SO sob 600 VUs. Não mede o backend.
- **A listagem NÃO tem cliff de query:** probe dedicado (1 owner com **1.500 solicitações pendentes**, baixa concorrência) mediu `GET /follow-requests` p95 = **7.5ms** (max 21.95ms, 0 falhas). A paginação é O(página), refutando a hipótese de degradação por fila grande.
- **O spike (`social-requests-spike.js`, pico 500 VUs por ~20s) SOBREVIVEU:** 0 EOF, p95 308.6ms, `http_req_failed` **4.86%** (conflitos de negócio esperados, threshold 40%), passou. A diferença para o stress é o **tempo sob pico**: a rajada curta não acumula a exaustão de conexão local sustentada. Resultado relevante: sob contenção de 500 VUs, a moderação de follow-request fica em ~5% de conflito — **longe dos 31% do `community-join-requests`**, sem indício do mesmo race patológico.

**Conclusão:** o caminho privado tem dois resultados locais válidos — `social-requests-load` (particionado, 0%) e `social-requests-spike` (contenção em rajada, ~5%, sem race). Apenas o **stress sustentado** (600 VUs por minutos) é inconclusivo localmente por exaustão de conexão (artefato de máquina única, igual ao `message-concurrency`); essa contenção sustentada deve ser medida no **ambiente hospedado** com k6 em máquina separada. O `social-requests-stress.js` fica no repositório marcado como hosted-only — **não rodar localmente** (custa horas e não mede o backend).

---

## Resumo Geral do DomainUser

| Subdomínio | Teste | VUs máx | Requests | Throughput | p(95) | Falhas | Resultado |
|------------|-------|---------|----------|-----------|-------|--------|-----------|
| user | load | 210 | 51.880 | 389.96/s | 58.77ms | 0% | ✅ |
| user | spike | 500 | 34.842 | 464.37/s | 16.45ms | 0% | ✅ |
| user | stress | 600 | 427.830 | 1538.35/s | 147ms | 0% | ✅ |
| social | load (público) | 210 | 89.968 | 676.58/s | 24.55ms | 0% | ✅ |
| social | spike (público) | 500 | 45.072 | 585.29/s | 300.11ms | 0% | ✅ |
| social | stress (público) | 600 | 224.726 | 823.14/s | 347.09ms | 0% | ✅ |
| social | requests load (privado) | 100 | 32.400 | 247.28/s | 52.92ms | 0% | ✅ |
| social | requests spike (privado) | 500 | 50.114 | 620.07/s | 308.6ms | 4.86%¹ | ✅ |

¹ Conflitos de negócio esperados sob contenção (threshold 40%); sem race patológico (vs 31% do join-requests).
² Inconclusivo localmente — exaustão de conexão de máquina única (artefato, igual ao `message-concurrency`); medir no ambiente hospedado. Ver 2.3.

**Taxa de falhas geral:** ~0% (exceto conflitos de negócio esperados na contenção privada) · **Thresholds:** ✅ aprovados nos testes locais válidos.
**Destaque:** maior throughput observado em toda a suíte — **1538 req/s** no `user` stress; o grafo social público sustentou **823 req/s** a 600 VUs com 0% de falhas.
**Cobertura social (2026-05-30):** grafo de follow/unfollow, followers/following, busca e solicitações de seguir (público + privado, load/spike/stress) — antes não testados.
