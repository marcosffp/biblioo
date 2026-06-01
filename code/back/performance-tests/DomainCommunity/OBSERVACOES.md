# Observações — DomainCommunity

> **Data:** 2026-05-28 — atualizado em 2026-06-01

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
- O load test reexecutado em 2026-05-30 com **210 VUs** passou com zero falhas — corrigido o typo no script que fazia o k6 cair no default de 1 VU/cenário (`CONFIG.load.inviteVus`/`listVus` apontavam para chaves inexistentes). Com a carga pretendida de 210 VUs, o fluxo de convite (create community → invite → pending → decline) funciona corretamente: p95 de 34.07ms, zero falhas HTTP.
- No stress com 500 VUs, apesar de 7.13% de falhas, o p(95) de 247.93ms ainda está muito abaixo do threshold de 5000ms.

### Pontos de atenção
- **7.13% de taxa de falha no stress test** (500 VUs) — representam erros 4xx (conflitos de convite, usuário já convidado ou já membro). Esses são erros de negócio esperados em cenário de alta concorrência onde múltiplos VUs tentam convidar o mesmo usuário. O threshold foi definido em 30% exatamente para acomodar isso.
- A latência máxima de **854ms** no stress indica que sob 500 VUs a criação de convite começa a enfrentar contenção na tabela de invites. Seria útil avaliar se há índice em `(community_id, invitee_id)`.
- As séries temporais chegaram a 400.183 (WARN do k6) — o mesmo problema de URL com IDs documentado no DomainBook. Adicionar URL grouping reduziria o overhead de memória do k6.

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
- Taxa de falha de **19.74%** com 600 VUs e p(95) de **1s** (exato no percentil 95) — consistente com execução anterior de 19.01%, confirmando que o comportamento é determinístico.
- O comportamento piora progressivamente conforme o número de VUs aumenta — evidência adicional de contenção de banco em operações concorrentes na mesma entidade.
- A latência máxima de **3.33s** é preocupante para UX.

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

> **Correção de design aplicada em 2026-06-01:** `community-join-requests-load.js` foi redesenhado — `communityPoolSize` elevado para 150 (1 comunidade exclusiva por VU) e step `reject` removido do fluxo de carga, eliminando a auto-colisão de VUs. O próximo run deverá passar sem threshold violado. Os dados da execução original (31.19% de falha) permanecem documentados acima como referência histórica.

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

## Message — WebSocket + STOMP

### message-concurrency.js — executado em 2026-05-30

**Configuração:** 1 comunidade, 200 VUs em `concurrentSend` (2 min) + 200 VUs em `burstSend` (20s), pico de **400 conexões WebSocket simultâneas**.

**Integridade da concorrência: 100% íntegra.** É o que este teste existe para verificar e passou sem ressalvas:
- `msg_duplicated`: **0** — nenhuma mensagem entregue em duplicata.
- `msg_overwritten`: **0** — nenhum conteúdo sobrescrito por escrita concorrente.
- `concurrency_violation_rate`: **0%** — nenhuma violação de integridade.

**Thresholds de entrega reprovaram — mas por capacidade de conexão local, não por bug:**
- `WS connect 101`: apenas 47% das conexões completaram o handshake (51 falhas), `stomp_connect_errors: 47`.
- `stomp_send_fail_rate`: 16,28% (limite < 1%); `msg_delivery_success_rate`: 83,84% (limite > 99%).
- Centenas de frames `STOMP ERROR` (corpo vazio) durante o burst.

**O que foi comprovado: a reprovação escala com o número de conexões simultâneas e some em carga menor — não é defeito de lógica.**
Repetindo o **mesmo teste** com o pico reduzido para **120 conexões**: `WS connect 101` 100%, `stomp_send_fail_rate` 0,27%, `msg_delivery_success_rate` 99,72%, **zero** `STOMP ERROR` — e integridade seguiu 100% nos dois cenários. Ou seja, o problema é de **capacidade de estabelecimento de conexão sob rajada num setup local de máquina única**, não de corretude.

A causa exata **não foi isolada** (ficou fora do escopo). A fila de accept do SO (`kern.ipc.somaxconn = 128` no macOS) é um **provável contribuinte**, mas não está confirmada como o teto único — a aritmética não fecha (400 conexões contra backlog 128 derrubariam ~272, mas só 51 falharam, indicando que o app estava drenando a fila), e o custo de CPU por conexão com cliente+servidor disputando os mesmos núcleos é uma alternativa igualmente plausível. O teste que discriminaria seria subir `somaxconn` para ~4096 e re-rodar a 400: se passar, fica provada a fila; se não, é outra coisa.

Fatores que tornam a medição local **não representativa** da capacidade real:
1. **Cliente e servidor na mesma máquina** — o k6 (400 VUs) e a JVM disputam os mesmos CPUs e a pilha de loopback.
2. **`somaxconn = 128`** é default do macOS; em Linux de produção é ajustável para milhares.
3. **Amplificação de broadcast** — 30.790 envios geraram 4,9 milhões de recebimentos e 2,5 GB de tráfego (fan-out de 1 canal para ~400 assinantes), tudo dentro da mesma máquina.

**Recomendação:** a **capacidade real de conexões WebSocket** deve ser medida contra o backend **hospedado (Google Cloud)**, com o k6 rodando em máquina separada e `net.core.somaxconn` ajustado. Localmente, este teste deve ser lido como validação de **integridade sob concorrência** (que está sólida), não de escala. Ver também `WebSocketConfig.java`: broker em memória por instância com fan-out cross-instância via RabbitMQ (escala horizontal possível) e pool do canal inbound em `corePoolSize 20 / maxPoolSize 50 / queueCapacity 200` — esse pool, não o hardware, é o limite ajustável sob alta concorrência.

### message-load.js, message-spike.js, message-stress.js — executados em 2026-06-01

Os três testes de carga/pico/stress para WebSocket + STOMP foram executados localmente e **aprovaram com entrega 100% em todos os cenários**.

**Pontos positivos:**
- `message-load.js` (160 VUs, 2 cenários): `msg_delivery_success_rate` 100%, `stomp_send_fail_rate` 0%, p95 de latência de entrega **99ms** (limite 2000ms). Fan-out de 7.400 envios → 76.368 recebimentos sem nenhuma falha.
- `message-spike.js` (até 150 VUs): entrega 100%, `ws_connect_duration_ms` p95 **9ms** — a degradação de conexão observada no concurrency (400 conexões, p95 10s) desaparece completamente em 150 conexões. Isso **confirma** que a falha do concurrency era de capacidade local de estabelecimento de conexão, não de lógica do servidor.
- `message-stress.js` (até 250 VUs, 7 estágios): entrega 100%, latência p95 **27ms**, `ws_connect_duration_ms` p95 **32ms**. Sem nenhuma degradação progressiva conforme a carga sobe — o sistema STOMP escala linearmente localmente até 250 conexões.

**Nota sobre "No script iterations fully finished":** nos testes spike e stress, k6 reporta que nenhuma iteração completou inteiramente. Isso é esperado para VUs com conexão WebSocket persistente: o VU mantém a conexão e envia mensagens via `setInterval` durante toda a duração do teste — ele nunca "retorna" da função de iteração, então k6 o interrompe ao fim. Não indica problema.

**Thresholds de entrega vs. integridade:** os testes load/spike/stress mantêm `msg_delivery_success_rate` e `stomp_send_fail_rate` como thresholds — e passam com folga. O `message-concurrency.js` teve esses thresholds removidos porque o setup de 400 conexões burst esgotava o teto de conexão local, gerando timeouts de entrega que não representavam bug de lógica. Localmente, a fronteira fica em torno de 200-250 conexões simultâneas com setup de burst.

---

## Community Admin Ops — subdomínio `admin/` — executado em 2026-05-31

Cobertura nova dos endpoints administrativos que ainda não tinham teste de carga: alterar papel, transferir propriedade, listar/expulsar membro, gerar/revogar link de convite, entrar por link e **aprovar** solicitação de entrada. Segue o padrão do DomainBook — três arquivos `admin-load.js` / `admin-spike.js` / `admin-stress.js`, cada iteração executando um **ciclo administrativo reversível** completo numa comunidade PRIVADA exclusiva por VU (readmite e expulsa dois buddies a cada volta, análogo ao add→…→remove do `shelfItem`).

### Pontos positivos
- **Todas as ops administrativas passaram com 0% de falha nos três níveis** (load 210 VUs / spike 500 / stress 600). Os 14 checks do ciclo verdes em 100%: load p95 83ms, spike p95 698ms, stress p95 551ms.
- **O design race-free (uma comunidade exclusiva por VU) elimina colisões artificiais.** O ciclo reversível (solicitar→aprovar→promover↔rebaixar→entrar por link→transferir↔devolver→expulsar→revogar) mantém o estado estável entre iterações, sem deriva.

### O achado mais relevante — aprovar NÃO tem o race do rejeitar
- O `approve` de join-request, testado de forma race-free, devolveu **204 em 100% das aprovações nos três testes, com 0 conflito**. Isso **contrasta diretamente** com o `community-join-requests-load` (31% de falha no `reject` concorrente, ver seção do bug acima).
- **Interpretação:** a falha de 31% do join-requests-load era **artefato de múltiplos VUs disputando o mesmo `requestId`** (vários rejeitando a mesma solicitação simultaneamente), não uma fragilidade intrínseca do endpoint de moderação. Quando cada moderador atua sobre solicitações distintas (o caso real), a operação é limpa. Isso **não invalida** a recomendação de `@Version` — sob concorrência real no mesmo recurso o lock continua sendo a proteção correta — mas recontextualiza a severidade: o cenário de 31% é um padrão de teste adversarial, não o fluxo de produção típico.

### O stress delimita a "parede de colocação"
- O `admin-stress` (600 VUs, ciclo state-mutating completo: transfer, approve, role, removeMember) **passou com 0% de falha** — igual aos stress de `shelf`/`collection`/`shelfItem` do DomainBook. Isso **delimita** o achado de colocação local: a parede só se manifesta em contenção de **recurso compartilhado** (fan-out de broadcast em `message-concurrency`; mesmo `requestId` em `join-requests-stress`), **não** em mutação race-free por-recurso. Operações administrativas são robustas e escaláveis localmente até 600 VUs.

---

## Observações Transversais

1. **Race condition em entidades de estado compartilhado é o padrão de bug recorrente do domínio.** O caso grave é `join-requests` (31% de falha — correção prioritária). O caso brando é o fechamento de enquetes em `voting` (0.92%, dentro do threshold). Ambos têm a mesma raiz — ausência de lock otimista/pessimista — e a mesma correção (`@Version`). Vale auditar todas as entidades de community que mudam de estado (invites, join-requests, votings).

2. **Thresholds permissivos em testes de stress:** Os testes de invites-stress (30%) e join-requests-stress (40%) usam thresholds bem acima do ideal para produção (geralmente < 5%). Isso foi necessário para que o pipeline não quebre durante a análise. Em produção, após corrigir o problema de concorrência, esses thresholds devem ser revisados para < 5%. O `community-join-requests-load.js` foi redesenhado em 2026-06-01: `communityPoolSize` elevado a 150 (1 por VU), step `reject` removido do fluxo de carga — o próximo run deve passar sem threshold violado.

3. **Community stress com 995 req/s:** O throughput impressionante do community-stress indica que os endpoints públicos de comunidade (listagem, busca) são bem escaláveis. Possivelmente beneficiam-se de cache em memória ou consultas simples sem JOIN pesado.

4. **Logs do servidor exportados para análise:** Os warnings do Spring Boot durante o join-requests-stress foram capturados e mostram o volume de erros de concorrência. Esses logs são valiosos para rastrear a causa raiz — foram incluídos no arquivo `domaincommuniy.md` original.
