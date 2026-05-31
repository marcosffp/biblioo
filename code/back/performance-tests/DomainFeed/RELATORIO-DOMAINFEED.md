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
| review | review-load/spike/stress | ❌ **Reprovado** (thresholds de latência cruzados + timeout de setup) |

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

## 5. Review (resenhas de livros) — ❌ REPROVADO

### 5.1 Load Test — `review-load.js` — ❌ thresholds cruzados

**Configuração:** 2 cenários (crud 158 + listing 52), 210 VUs, 2m48s.

| Métrica | Threshold | Resultado | Status |
|---------|-----------|-----------|--------|
| `http_req_duration` p(95) | < 1000ms | **3.5s** | ❌ |
| `{scenario:crud}` p(95) | < 1500ms | **3.75s** | ❌ |
| `{scenario:listing}` p(95) | < 500ms | **3.44s** | ❌ |
| `http_req_failed` rate | < 2% | 0.00% | ✅ |

- Métricas HTTP geral: avg **360.7ms**, med 19.03ms, **max 13.19s**, p(90) 265.7ms, p(95) **3.5s**.
- 33.354 req (199.01/s), checks 39.332 ✅ 100% (funcionalmente correto), 0 falhas HTTP.
- **Diagnóstico:** as requisições não falham (status correto), mas a **latência estoura** sob 210 VUs — mediana 19ms vs p(95) 3.5s e max 13.19s (cauda longa severa).
- **⚠️ Confundidor:** review foi o **último** subdomínio a rodar, contra o estado de banco mais saturado da sessão (após ~107k usuários do user-stress e os stress de post/comment/commentInteraction). Os dados não separam "review é lento" de "banco estava inchado". A assinatura é *consistente* com **query sem índice / N+1**, mas isso é hipótese. **Ação: rerodar review isolado e cedo (banco limpo) para confirmar.**

### 5.2 Spike Test — `review-spike.js` — ⚠️ setup falhou

- Erro k6: `setup() execution timed out after 300 seconds`.
- O teste **não executou de forma representativa**: apenas 869 requests. p(95)=521.84ms é exibido como ✓ mas sobre amostra mínima — **não conclusivo**.
- **Diagnóstico:** a fase de `setup` (criação em massa de reviews para popular o cenário) não terminou em 300s, confirmando que **criar/listar reviews é lento**.

### 5.3 Stress Test — `review-stress.js` — ❌ setup falhou + threshold cruzado

- Erro k6: `setup() execution timed out after 600 seconds`.
- Apenas 901 requests; `http_req_duration` p(95)=**1.13s** cruzou o threshold de 1000ms.
- **Diagnóstico:** mesmo com 600s de timeout de setup, a preparação não concluiu. Confirma gargalo de performance no caminho de reviews.

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
| review | load | 210 | 33.354 | 199.01/s | **3.5s** | 0% | ❌ |
| review | spike | 500 | — | — | (setup timeout) | — | ⚠️ |
| review | stress | 600 | — | — | **1.13s** (setup timeout) | — | ❌ |

**12 de 15 testes aprovados.** Feed, post, comment e commentInteraction são robustos e escaláveis até 600 VUs com 0% de falhas. O subdomínio **review** é o único ponto crítico do DomainFeed e requer otimização antes de validação.