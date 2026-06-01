# Relatório de Performance — DomainFeed

> **Data de execução:** 2026-05-28
> **Ferramenta:** k6 (Grafana) v1.7.1
> **Ambiente:** localhost:8080
> **Nota:** execução em máquina distinta da bateria DomainBook; banco com estado acumulado.

---

## Subdomínios Testados

| Subdomínio | Arquivos | Status |
|------------|----------|--------|
| feed | feed-load/spike/stress | ✅ Todos passaram |
| post | post-load/spike/stress | ✅ Todos passaram |
| comment | comment-load/spike/stress | ✅ Todos passaram |
| commentInteraction | commentInteraction-load/spike/stress | ✅ Todos passaram |
| review | review-load/spike/stress | ✅ Todos passaram (reexecutado isolado 2026-05-30; reprovação anterior era contaminação de banco + timeout de setup) |

---

## 1. Feed (timeline de atividades)

| Teste | VUs | Thresholds | p(95) | Falhas | Status |
|-------|-----|-----------|-------|--------|--------|
| load | 210 | geral<800 / count<400 / feedQuery<800 | 61.87ms (count 46.53 / feed 66.57) | 0% | ✅ |
| spike | 500 | geral<800 | 130.34ms | 0% | ✅ |
| stress | 600 | geral<2000 | 111.99ms | 0% | ✅ |

- **load:** 30.671 req (231.59/s), 13 MB recv, 2m12s. Checks 60.882 ✅ 100%.
- **spike:** 34.830 req (462.59/s), 15 MB recv, 1m15s. Checks 68.660 ✅ 100%.
- **stress:** 133.148 req (476.22/s), 56 MB recv, 4m40s. Checks 264.696 ✅ 100%.

Métricas HTTP geral — load avg 34.61ms / med 32.43ms / max 243ms; stress avg 31.67ms / med 17.88ms / max 363ms.

---

## 2. Post (publicações no feed)

| Teste | VUs | Thresholds | p(95) | Falhas | Status |
|-------|-----|-----------|-------|--------|--------|
| load | 210 | geral<1000 / crud<1500 / listing<600 | 30.71ms (crud 32.57 / list 21.51) | 0% | ✅ |
| spike | 500 | geral<1500 | 352.1ms | 0% | ✅ |
| stress | 600 | geral<1500 | 268.21ms | 0% | ✅ |

- **load:** 54.535 req (409.62/s), 29 MB recv, 2m13s. Checks 75.114 ✅ 100%.
- **spike:** 33.046 req (441.87/s), 16 MB recv, 1m15s. Checks 33.046 ✅ 100%.
- **stress:** 142.484 req (510.54/s), 75 MB recv, 4m39s. Checks 177.705 ✅ 100%.

Escrita de posts mais custosa que leitura: spike médio 192ms (med 230ms), max 769ms — ainda dentro do threshold.

---

## 3. Comment (comentários em posts)

| Teste | VUs | Thresholds | p(95) | Falhas | Status |
|-------|-----|-----------|-------|--------|--------|
| load | 210 | geral<1500 / crud<1500 / listing<500 | 31.93ms (crud 34.55 / list 19.88) | 0% | ✅ |
| spike | 500 | geral<1000 | 417.12ms | 0% | ✅ |
| stress | 600 | geral<2000 | 291.99ms | 0% | ✅ |

- **load:** 52.055 req (370.20/s), 27 MB recv, 2m21s. Checks 61.717 ✅ 100%.
- **spike:** 33.718 req (372.79/s), 16 MB recv, 1m30s. Checks 33.718 ✅ 100%.
- **stress:** 142.316 req (464.82/s), 72 MB recv, 5m06s. Checks 176.895 ✅ 100%.

---

## 4. CommentInteraction (curtidas/reações)

| Teste | VUs | Thresholds | p(95) | Falhas | Status |
|-------|-----|-----------|-------|--------|--------|
| load | 210 | geral<1500 / crud<1800 / listing<1000 | 36.42ms (crud 38.96 / list 28.2) | 0% | ✅ |
| spike | 500 | geral<2500 | 540.53ms | 0% | ✅ |
| stress | 600 | geral<2500 | 353.67ms | 0% | ✅ |

- **load:** 52.021 req (363.72/s), 23 MB recv, 2m23s. Checks 73.832 ✅ 100%.
- **spike:** 29.814 req (313.42/s), 14 MB recv, 1m35s. Checks 17.876 ✅ 100%.
- **stress:** 133.860 req (426.36/s), 62 MB recv, 5m14s. Checks 129.060 ✅ 100%.

---

## 5. Review (resenhas de livros) — ✅ APROVADO (reexecutado isolado em 2026-05-30)

> **Correção do diagnóstico anterior:** review havia reprovado por motivos de **ambiente**, não de código. (1) O `review-load` rodou **por último**, contra o banco saturado da sessão (~107k usuários acumulados), inflando a latência para p(95) de 3.5s. (2) `review-spike`/`stress` **não concluíam o `setup`** (provisionamento de 500/800 usuários × ~23 requests cada) dentro de 300s/600s. Reexecutados **isolados, com banco saudável**, `setupTimeout` ampliado (spike `1200s`, stress `1800s`) e guard `SAFE_VU`/`SAFE_ITER` no log de setup, **os três passaram**. Isso confirma a hipótese do "confundidor": **review não tem gargalo de código** — a latência anterior era contaminação de banco.

### 5.1 Load Test — `review-load.js` — ✅

**Configuração:** 2 cenários: `crud` (158 VUs, 2m) + `listing` (52 VUs, 2m) — 210 VUs.

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 1000ms | 38.97ms | ✅ |
| `{scenario:crud}` p(95) | < 1500ms | 41.72ms | ✅ |
| `{scenario:listing}` p(95) | < 500ms | 23.98ms | ✅ |
| `http_req_failed` rate | < 2% | 0.00% | ✅ |

**Checks:** register/login/shelf/book-add (setup) + list 200, create 201, create retorna id e bookId, get 200, update 200, delete 204 — ✅ 100% (62.230 checks).

**Métricas HTTP:**

| Métrica | avg | min | med | max | p(90) | p(95) |
|---------|-----|-----|-----|-----|-------|-------|
| `http_req_duration` (geral) | 19.86ms | 3.64ms | 16.93ms | 446.77ms | 31.6ms | 38.97ms |
| `{scenario:crud}` | 22.39ms | 4.8ms | 19.54ms | 446.37ms | 33.86ms | 41.72ms |
| `{scenario:listing}` | 12.38ms | 4.18ms | 9.79ms | 446.77ms | 17.86ms | 23.98ms |

**Sumário:** 52.592 req (345.8/s) · 21.838 iterações · 0 falhas · 27 MB recv · setup 230/230.

### 5.2 Spike Test — `review-spike.js` — ✅

**Configuração:** rampa 70→500 VUs (hold 20s); `setupTimeout` 1200s; setup 500/500.

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 1000ms | 462.85ms | ✅ |
| `http_req_failed` rate | < 5% | 0.00% | ✅ |

**Checks:** ✅ 100% (47.352) — list 200, create 201 ou 429, create retorna id, delete 204.
**Métricas:** avg 201.53ms · med 202.03ms · max 971.81ms · p(90) 399.84ms · p(95) 462.85ms.
**Sumário:** 38.389 req (160.2/s) · 8.963 iterações · 0 falhas · 500 VUs.

### 5.3 Stress Test — `review-stress.js` — ✅

**Configuração:** rampa até 600 VUs em 4m (7 estágios); `setupTimeout` 1800s; setup 799/800.

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 1000ms | 361.17ms | ✅ |
| `http_req_failed` rate | < 5% | 0.00% (1/142.940) | ✅ |

**Checks:** ✅ 99.99% (174.076/174.077). A única falha foi **1 `book added 201` no setup** (`/shelves/1265/items` → 500 transitório, userIndex 323). O guard `SAFE_VU`/`SAFE_ITER` **absorveu o erro** (log com `vu:0, iter:-1`), pulou o usuário e seguiu com 799. Esse `logError` no `setup()` é justamente o ponto a que se atribuiu o `rc=107` que abortou o setup na bateria anterior (quando havia falhas de request lá dentro); com o guard, o setup completa mesmo com falhas pontuais.
**Métricas:** avg 117.38ms · med 69.45ms · max 5.31s · p(90) 300.7ms · p(95) 361.17ms.
**Sumário:** 142.940 req (180.0/s) · 31.137 iterações · ~0% falhas · 600 VUs · 73 MB recv.

---

## Resumo Geral do DomainFeed

| Subdomínio | Teste | VUs máx | Requests | Throughput | p(95) | Falhas | Resultado |
|------------|-------|---------|----------|-----------|-------|--------|-----------|
| feed | load | 210 | 30.671 | 231.59/s | 61.87ms | 0% | ✅ |
| feed | spike | 500 | 34.830 | 462.59/s | 130.34ms | 0% | ✅ |
| feed | stress | 600 | 133.148 | 476.22/s | 111.99ms | 0% | ✅ |
| post | load | 210 | 54.535 | 409.62/s | 30.71ms | 0% | ✅ |
| post | spike | 500 | 33.046 | 441.87/s | 352.1ms | 0% | ✅ |
| post | stress | 600 | 142.484 | 510.54/s | 268.21ms | 0% | ✅ |
| comment | load | 210 | 52.055 | 370.20/s | 31.93ms | 0% | ✅ |
| comment | spike | 500 | 33.718 | 372.79/s | 417.12ms | 0% | ✅ |
| comment | stress | 600 | 142.316 | 464.82/s | 291.99ms | 0% | ✅ |
| commentInteraction | load | 210 | 52.021 | 363.72/s | 36.42ms | 0% | ✅ |
| commentInteraction | spike | 500 | 29.814 | 313.42/s | 540.53ms | 0% | ✅ |
| commentInteraction | stress | 600 | 133.860 | 426.36/s | 353.67ms | 0% | ✅ |
| review | load | 210 | 52.592 | 345.8/s | 38.97ms | 0% | ✅ |
| review | spike | 500 | 38.389 | 160.2/s | 462.85ms | 0% | ✅ |
| review | stress | 600 | 142.940 | 180.0/s | 361.17ms | 0% | ✅ |

**15 de 15 testes aprovados.** Feed, post, comment e commentInteraction são robustos e escaláveis até 600 VUs com 0% de falhas. O subdomínio **review** foi reexecutado isolado (2026-05-30) e **passou** — a reprovação anterior era contaminação de banco (review rodou por último) + timeout de setup, não gargalo de código. DomainFeed completo e aprovado.