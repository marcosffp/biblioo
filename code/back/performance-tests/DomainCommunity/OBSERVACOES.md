# Observações — DomainCommunity

> **Data:** 2026-05-28

---

## Community (CRUD e descoberta de comunidades)

### Pontos positivos
- O load test com 4 cenários simultâneos (leaveJoin, manage, members, read) passou com folga: p(95) geral de **15.43ms** com 90 VUs. É o subdomínio com menor latência entre os testados.
- O stress test com 500 VUs atingiu throughput impressionante de **995.2 req/s** — quase 1.000 requests por segundo com p(95) de apenas 47.95ms. O threshold foi definido generosamente em 5000ms, mas o resultado real foi ~100× melhor.
- Spike test com 200 VUs: p(95) de 13.9ms — praticamente sem degradação comparado ao load test.

### Pontos de atenção
- O cenário `leaveJoin` (join + leave em loop) tem latência ~2× maior que `read` no load test (13.73ms vs 7.35ms). Operações de membership têm custo de escrita, o que é esperado, mas merece índice na tabela de membros para evitar table scan em operações de join concorrentes.
- O stress test não inclui operações de leitura detalhada (GET /communities/{id} com membros, GET /book/{bookId}) — focou apenas em create e list. Os testes mais completos ficaram no load test.

---

## Community Invites (convites para comunidades privadas)

### Pontos positivos
- O load test com apenas 2 VUs passou com zero falhas — o fluxo de convite (create community → invite → pending → decline) funciona corretamente em condições normais.
- No stress com 600 VUs, apesar de 8.06% de falhas, o p(95) de 319.35ms ainda está muito abaixo do threshold de 5000ms.

### Pontos de atenção
- **8.06% de taxa de falha no stress test** — representam erros 4xx (conflitos de convite, usuário já convidado ou já membro). Esses são erros de negócio esperados em cenário de alta concorrência onde múltiplos VUs tentam convidar o mesmo usuário. O threshold foi definido em 30% exatamente para acomodar isso.
- A latência máxima de **1.19s** no stress indica que sob 600 VUs a criação de convite começa a enfrentar contenção na tabela de invites. Seria útil avaliar se há índice em `(community_id, invitee_id)`.
- As séries temporais chegaram a 400.192 (WARN do k6) — o mesmo problema de URL com IDs documentado no DomainBook. Adicionar URL grouping reduziria o overhead de memória do k6.

---

## Community Join Requests — PROBLEMA IDENTIFICADO

### Join Requests Load Test — `community-join-requests-load.js`

**Este foi o único teste com threshold violado em todo o projeto até agora.**

- **Taxa de falha HTTP: 31.19%** (17.952 falhas de 57.539 requests) — muito acima do threshold de 5%.
- **Check falho:** `reject 204` — apenas 30% das rejeições foram bem-sucedidas (4.483 de ~14.850).

**Diagnóstico baseado nos logs do servidor:**

Os logs do Spring Boot mostram claramente o problema:
```
WARN: CommunityBusinessException: Esta solicitação já foi processada.
WARN: CommunityBusinessException: Já existe uma solicitação pendente.
```

Duas causas distintas:
1. **"Esta solicitação já foi processada"** — ao tentar rejeitar uma solicitação que outro VU já rejeitou (race condition de leitura-escrita: VU A e VU B leram o mesmo join request com status PENDING e ambos tentam mudar para REJECTED).
2. **"Já existe uma solicitação pendente"** — ao tentar criar nova solicitação quando já há uma pendente (VUs fazem `request → reject` em loop, mas o ciclo se dessincroniza e alguns criam nova solicitação antes da anterior ser processada).

**Root cause:** Ausência de controle de concorrência otimista (pessimistic lock ou `SELECT FOR UPDATE`) na entidade `JoinRequest`. Quando dois VUs leem a mesma solicitação como PENDING e ambos tentam processá-la, apenas o primeiro sucede; o segundo recebe exceção de negócio que o handler resolve em 4xx (provavelmente 409 Conflict ou 422).

**Impacto:** Em produção com 150+ usuários concorrentes tentando entrar/rejeitar na mesma comunidade, haverá falhas visíveis para os usuários. O fluxo de moderação de comunidade não é safe para alta concorrência.

### Join Requests Stress Test — `community-join-requests-stress.js`

- O stress test foi ajustado com threshold de 40% para acomodar as falhas conhecidas.
- Taxa de falha de **19.19%** com 600 VUs e p(95) de **997.23ms** (quase 1 segundo no percentil 95).
- O comportamento piora progressivamente conforme o número de VUs aumenta — evidência adicional de contenção de banco em operações concorrentes na mesma entidade.
- A latência máxima de **3.21s** é preocupante para UX.

### Recomendação de correção

Aplicar lock otimista na entidade `JoinRequest`:
```java
@Version
private Long version;
```
Ou lock pessimista na query de busca:
```java
@Lock(LockModeType.PESSIMISTIC_WRITE)
Optional<JoinRequest> findById(Long id);
```
Isso garantirá que apenas um thread possa processar cada solicitação por vez, eliminando as exceções de concorrência.

---

## Community Manage (CRUD em loop de stress) — executado em 2026-05-28

### Pontos positivos
- CREATE → UPDATE → DELETE de comunidades em loop sob 200 VUs: **0% de falhas**, p(95) de **29.55ms**, 106.973 requests. O ciclo de gerenciamento de comunidades é estável e rápido.

---

## MessageRest (leitura REST de mensagens) — executado em 2026-05-28

### Pontos positivos
- Os 3 testes passaram com **0% de falhas**. Listagem (`/messages`) e sync (`/messages/sync`) são eficientes: no load, p(95) de 102ms (listing) e 70ms (sync), ambos dentro dos thresholds rigorosos (800ms / 500ms).
- Stress com 600 VUs: p(95) de 462ms, bem abaixo do limite de 2500ms.

### Pontos de atenção
- **Alto volume de dados:** o stress recebeu **1.3 GB** (mensagens com payload textual). Como no DomainShare, a banda é mais relevante que a CPU aqui.
- O upload de mídia (`POST /media` → Cloudinary) foi **intencionalmente excluído** para evitar custo de API — esse caminho permanece **não testado** e deve ser avaliado separadamente (provável gargalo de I/O externo).

---

## Voting (enquetes) — executado em 2026-05-28

### Pontos positivos
- read/vote/manage rápidos no load (p(95) geral 24.93ms). Spike (500 VUs) e stress (600 VUs) passaram com 0% de falhas; stress sustentou **778 req/s**.

### Pontos de atenção
- **Conflito de concorrência ao fechar enquetes (versão branda do bug de join-requests).** No voting-load, o check `close voting 200` falhou em **22%** (106/485) e a taxa HTTP foi de 0.92% — múltiplos VUs do cenário `manage` tentam fechar a **mesma** enquete simultaneamente, e só o primeiro sucede. Ficou dentro do threshold (< 1%), mas é o **mesmo padrão de race condition** de `JoinRequest`. Recomenda-se aplicar o mesmo lock otimista (`@Version`) na entidade de votação/enquete.
- Sob spike, a latência de registro de voto sobe (med 423ms) — escrita concorrente no mesmo agregado de votos. Aceitável, mas vale monitorar.

---

## Subdomínios Não Executados

### message (WebSocket + STOMP) — fora desta bateria
- **Testes mais complexos do DomainCommunity** — envolvem WebSocket com protocolo STOMP, carga deliberadamente menor (send 100 / spike 150 / stress 250 VUs) e setup mais pesado.
- `message-load/spike/stress.js` + `message-concurrency.js` (este último **modificado no git** — revisar antes de executar).
- Ficaram de fora por exigirem WebSocket habilitado e setup distinto; recomenda-se rodá-los em sessão dedicada.

---

## Observações Transversais

1. **Race condition em entidades de estado compartilhado é o padrão de bug recorrente do domínio.** O caso grave é `join-requests` (31% de falha — correção prioritária). O caso brando é o fechamento de enquetes em `voting` (0.92%, dentro do threshold). Ambos têm a mesma raiz — ausência de lock otimista/pessimista — e a mesma correção (`@Version`). Vale auditar todas as entidades de community que mudam de estado (invites, join-requests, votings).

2. **Thresholds permissivos em testes de stress:** Os testes de invites-stress (30%) e join-requests-stress (40%) usam thresholds bem acima do ideal para produção (geralmente < 5%). Isso foi necessário para que o pipeline não quebre durante a análise. Em produção, após corrigir o problema de concorrência, esses thresholds devem ser revisados para < 5%.

3. **Community stress com 995 req/s:** O throughput impressionante do community-stress indica que os endpoints públicos de comunidade (listagem, busca) são bem escaláveis. Possivelmente beneficiam-se de cache em memória ou consultas simples sem JOIN pesado.

4. **Logs do servidor exportados para análise:** Os warnings do Spring Boot durante o join-requests-stress foram capturados e mostram o volume de erros de concorrência. Esses logs são valiosos para rastrear a causa raiz — foram incluídos no arquivo `domaincommuniy.md` original.
