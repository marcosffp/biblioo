# Comparação de Carga — Testes Pendentes vs. Executados

> **Data:** 2026-05-28
> **Objetivo:** verificar, antes de rodar os 43 testes pendentes, se eles têm perfil de carga
> equivalente aos 19 já executados (VUs, durações de estágio e thresholds).

---

## Template padrão (validado nos testes já executados — DomainBook + Community)

| Tipo | VUs / estágios | Durações | Thresholds típicos |
|------|----------------|----------|--------------------|
| **load**   | constant-vus, ~150 + 60 (≈210 VUs) | 2m | p95 1500ms · fail < 5% |
| **spike**  | base 70 → pico 500 (book/dna: 50→300) | 10s+5s+20s+5s+10s (~50s) | p95 1000–2500ms · fail < 5% |
| **stress** | rampa `[20, 50, 100, 200, 300, 400, 600]` | 30s por estágio (~4m) | p95 1000–5000ms · fail < 5–10% |

Todos os spikes usam o mesmo bloco de estágios (rampUpBase/rampToPeak/holdPeak/rampDown/cooldown).
Todos os stress usam `stageDuration: '30s'`.

---

## Classificação dos 43 pendentes

### ✅ Carga IDÊNTICA ao template — seguros para rodar direto

| Domain / subdomínio | load (VUs) | spike (base→pico) | stress (máx) | Thresholds |
|---|---|---|---|---|
| **Feed/feed**              | 158+52 | 70→500 | →600 | spike p95 800 / stress 2000 · 5% |
| **Feed/post**              | 158+52 | 70→500 | →600 | stress p95 1500 · 5% |
| **Feed/comment**           | 158+52 | 70→500 | →600 | stress p95 2000 · 5% |
| **Feed/commentInteraction**| 150+60 | 70→500 | →600 | 5% |
| **Feed/review**            | 158+52 | 70→500 | →600 | 5% |
| **User/user**              | 84+126 | 70→500 | →600 | spike p95 2000 / stress 5000 · 10% |
| **Share/shareCard**        | 150    | 70→500 | →600 | p95 3000 · 5% |
| **Trending/trending**      | 210    | 70→500 | →600 | p95 2000 · 5% |
| **Community/messageRest**  | 80+40  | 70→500 | →600 | p95 2500 · 5% |
| **Community/voting**       | 84+21+105 | →500 | →600 | stress p95 5000 · 10% |
| **Community/community-manage-stress** | — | — | →200 | p95 5000 · 10% (= community-stress, mais leve) |

> Mesmo template de VUs, mesmas durações de estágio, mesma estrutura de thresholds dos
> DomainBook/Community já aprovados. Os valores de p95 variam por endpoint, mas dentro da mesma faixa.

### ⚠️ Carga DELIBERADAMENTE MAIS LEVE — coerente com o tipo de endpoint

| Teste | Diferença vs. template | Motivo provável |
|---|---|---|
| **Recommendation/recommendation** | load só **60 VUs** (vs 210); stress para em **400** | endpoint de processamento pesado |
| **Recommendation/roll-dice**      | load 150; stress para em **400** | recomendação computada |
| **Dna/dna**                       | spike 50→**300**; stress para em **400** | agregação de perfil mais custosa |

São mais leves **por design**. Não comparáveis 1:1 com book/feed, mas a configuração faz sentido.
Mesma estrutura de thresholds (p95General + failRate).

### 🔴 Carga MUITO MENOR + setup especial — rodar por último

| Teste | Diferença | Motivo |
|---|---|---|
| **Community/message** (load/spike/stress) | send 100 · spike só →**150** · stress só →**250** | WebSocket+STOMP — conexões persistentes muito mais pesadas que HTTP |
| **Community/message-concurrency** | burst 200 VUs | teste especializado; **arquivo modificado no git (`M`)** — revisar antes |

Particularidades do `message`:
- holdPeak **30s** + cooldown **30s** (vs 20s/10s do padrão) — observa recuperação do servidor.
- Thresholds próprios: `stomp_send_fail_rate`, `msg_delivery_success_rate`, `msg_delivery_latency_ms`.
- Requer WebSocket habilitado + setup de 80 usuários / 10 comunidades.

---

## Conclusão

- **~34 dos 43 pendentes** (Feed, User, Share, Trending, messageRest, voting, community-manage)
  têm **carga idêntica** ao template já validado → previsíveis, podem rodar direto.
- **9 testes** divergem: Recommendation/roll-dice/Dna são **mais leves de propósito** (pico 300–400);
  os 4 de **message (WebSocket)** estão realmente fora do padrão e exigem setup + revisão do
  `message-concurrency.js`.

**Pré-requisitos comuns antes de rodar:** backend em `localhost:8080`; `bookId: 1` (e `[1,2,3,4]`
para voting) populados; usuários/comunidades de setup criados pelos próprios scripts.
