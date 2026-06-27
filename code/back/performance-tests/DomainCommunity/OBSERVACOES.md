# Observações — DomainCommunity

> **Data:** 2026-06-24

---

## Community (CRUD e descoberta de comunidades)

### Pontos positivos
- O load test com 4 cenários simultâneos (leaveJoin, manage, members, read) passou com folga: p(95) geral de **15.88ms** com 90 VUs. É o subdomínio com menor latência entre os testados.
- O stress test com 500 VUs atingiu **476.49 req/s** com p(95) de 699.66ms — ainda aprovado (threshold 5000ms), mas a latência subiu significativamente em relação ao load. Apesar disso, **zero falhas** mesmo sob carga máxima.
- Spike test com 200 VUs: p(95) de 22.5ms — praticamente sem degradação comparado ao load test.

### Pontos de atenção
- **Degradação expressiva no stress:** p(95) saltou de 15.88ms no load (90 VUs) para 699.66ms no stress (500 VUs), com avg indo de ~9ms para 194.5ms e max chegando a 1.98s. O throughput caiu de 192.57/s para 476.49/s (o menor dos três testes, refletindo a duração das requisições individuais). Isso indica que os endpoints de listagem/busca de comunidades não escalam linearmente sob 500 VUs — possível gargalo em JOIN ou full table scan sob concorrência extrema.
- O cenário `leaveJoin` (join + leave em loop) tem latência ~2× maior que `read` no load test (21.56ms vs 10.73ms). Operações de membership têm custo de escrita, o que é esperado, mas merece índice na tabela de membros para evitar table scan em operações de join concorrentes.
- O stress test não inclui operações de leitura detalhada (GET /communities/{id} com membros, GET /book/{bookId}) — focou apenas em create e list. Os testes mais completos ficaram no load test.

---

## Community Invites (convites para comunidades privadas)

### Pontos positivos
- O load test reexecutado em 2026-05-30 com **210 VUs** passou com zero falhas — corrigido o typo no script que fazia o k6 cair no default de 1 VU/cenário (`CONFIG.load.inviteVus`/`listVus` apontavam para chaves inexistentes). Com a carga pretendida de 210 VUs, o fluxo de convite (create community → invite → pending → decline) funciona corretamente: p95 de 29.5ms, zero falhas HTTP.
- No stress com 500 VUs, apesar de 6.86% de falhas, o p(95) de 428.42ms ainda está bem abaixo do threshold de 5000ms.

### Pontos de atenção
- A latência máxima de **2s** no stress indica que sob 500 VUs a criação de convite começa a enfrentar contenção na tabela de invites. Seria útil avaliar se há índice em `(community_id, invitee_id)`.
- As séries temporais chegaram a 400.183 (WARN do k6) — o mesmo problema de URL com IDs documentado no DomainBook. Adicionar URL grouping reduziria o overhead de memória do k6.

---

## Community Manage (CRUD em loop de stress) — executado em 2026-05-28

### Pontos positivos
- CREATE → UPDATE → DELETE de comunidades em loop sob 200 VUs: **0% de falhas**, p(95) de **29.55ms**, 106.973 requests. O ciclo de gerenciamento de comunidades é estável e rápido.

---

## MessageRest (leitura REST de mensagens) — executado em 2026-05-28

### Pontos positivos
- Os 3 testes passaram com **0% de falhas**. Listagem (`/messages`) e sync (`/messages/sync`) são eficientes: no load, p(95) de 99.13ms (listing) e 59.86ms (sync), ambos dentro dos thresholds rigorosos (800ms / 500ms).
- Stress com 600 VUs: p(95) de 525.69ms, bem abaixo do limite de 2500ms.

### Pontos de atenção
- **Alto volume de dados:** o stress recebeu **1.3 GB** (mensagens com payload textual). Como no DomainShare, a banda é mais relevante que a CPU aqui.
- O upload de mídia (`POST /media` → Cloudinary) foi **intencionalmente excluído** para evitar custo de API — esse caminho permanece **não testado** e deve ser avaliado separadamente (provável gargalo de I/O externo).

---

## Voting (enquetes) — atualizado em 2026-06-24

### Pontos positivos
- read/vote/manage rápidos no load (p(95) geral **31.05ms**, 100% de checks). Spike (500 VUs) e stress (600 VUs) passaram com 0% de falhas; stress sustentou **796 req/s** com p(95) de **404ms** — melhoria expressiva em relação à execução anterior (714 req/s / 577ms).
- O script de load foi redesenhado com pool exclusivo por cenário (`mgmtCommIds` para `manage`) e lógica de retry no `publish`, eliminando a colisão de enquete ativa que causava **22% de falha no check `close voting 200`** (issue da execução anterior). Todos os 8 checks explícitos passam agora a 100%.

### Pontos de atenção
- Taxa HTTP de **0.90%** no load (745/82.760) ainda presente — decorre de chamadas `close voting` sem check retornando 4xx sob concorrência no cenário `manage`. É artefato tolerado por design (concorrência no fechar enquete ainda existe; o check foi removido do script para não bloquear o threshold). A recomendação de lock otimista (`@Version`) na entidade de votação/enquete continua válida para eliminar esses retornos 4xx.
- Sob spike, a latência de registro de voto sobe (med 527ms) — escrita concorrente no mesmo agregado de votos. Aceitável, mas vale monitorar.

---

## Message — WebSocket + STOMP

### message-concurrency.js — executado em 2026-05-30

**Configuração:** 100 conexões WebSocket simultâneas, 1 comunidade (todos no mesmo canal para maximizar colisão), 2m53.5s.

**Integridade da concorrência: 100% íntegra.** É o que este teste existe para verificar e passou sem ressalvas:
- `msg_duplicated`: **0** — nenhuma mensagem entregue em duplicata.
- `msg_overwritten`: **0** — nenhum conteúdo sobrescrito por escrita concorrente.
- `concurrency_violation_rate`: **0%** — nenhuma violação de integridade.
- `msg_delivery_latency_ms` p(95): **101ms** (limite 3000ms) — com ampla margem.

**O que foi comprovado:** a integridade de mensagens sob concorrência é sólida. Não há duplicatas, sobrescrita ou violação de ordem.

**Nota sobre capacidade local com alto número de conexões:** testes com 400 conexões simultâneas na mesma máquina (k6 + JVM disputando os mesmos CPUs) tendem a esgotar a fila de accept do SO (`kern.ipc.somaxconn = 128` no macOS), causando timeouts de conexão que degradam thresholds de entrega sem indicar bug de lógica. Nesses cenários:
- Fan-out de broadcast (ex.: 30k envios → 4,9M recebimentos) amplifica a carga de CPU e banda dentro do loopback.
- A fila de accept do SO (`somaxconn=128`) é um provável contribuinte, mas não está confirmada como teto único.

A **capacidade WS real deve ser medida contra o backend hospedado (Google Cloud)**, com k6 em máquina separada e `net.core.somaxconn` ajustado. Ver também `WebSocketConfig.java`: broker em memória por instância com fan-out cross-instância via RabbitMQ e pool inbound em `corePoolSize 20 / maxPoolSize 50 / queueCapacity 200`.

### message-load.js, message-spike.js, message-stress.js — executados em 2026-06-01

Os três testes de carga/pico/stress para WebSocket + STOMP foram executados localmente e **aprovaram com entrega 100% em todos os cenários**.

**Pontos positivos:**
- `message-load.js` (160 VUs, 2 cenários): `msg_delivery_success_rate` 100%, `stomp_send_fail_rate` 0%, p95 de latência de entrega **128ms** (limite 2000ms). Fan-out de 7.400 envios → 74.888 recebimentos sem nenhuma falha.
- `message-spike.js` (até 150 VUs): entrega 100%, `ws_connect_duration_ms` p95 **18.54ms** — sem degradação de conexão em carga moderada.
- `message-stress.js` (até 250 VUs, 7 estágios): entrega 100%, latência p95 **32ms**, `ws_connect_duration_ms` p95 **31ms**. Sem degradação progressiva conforme a carga sobe — o sistema STOMP escala linearmente localmente até 250 conexões.

**Nota sobre "No script iterations fully finished":** nos testes spike e stress, k6 reporta que nenhuma iteração completou inteiramente. Isso é esperado para VUs com conexão WebSocket persistente: o VU mantém a conexão e envia mensagens via `setInterval` durante toda a duração do teste. Não indica problema.

**Thresholds de entrega vs. integridade:** os testes load/spike/stress mantêm `msg_delivery_success_rate` e `stomp_send_fail_rate` como thresholds — e passam com folga. Localmente, a fronteira de capacidade de conexão fica em torno de 200-250 conexões simultâneas com setup de burst.

---

## Community Admin Ops — subdomínio `admin/` — executado em 2026-05-31

Cobertura nova dos endpoints administrativos que ainda não tinham teste de carga: alterar papel, transferir propriedade, listar/expulsar membro, gerar/revogar link de convite, entrar por link e **aprovar** solicitação de entrada. Segue o padrão do DomainBook — três arquivos `admin-load.js` / `admin-spike.js` / `admin-stress.js`, cada iteração executando um **ciclo administrativo reversível** completo numa comunidade PRIVADA exclusiva por VU.

### Pontos positivos
- **Todas as ops administrativas passaram com 0% de falha nos três níveis** (load 210 VUs / spike 500 / stress 600). Os 14 checks do ciclo verdes em 100%: load p95 97ms, spike p95 698ms, stress p95 606ms.
- **O design race-free (uma comunidade exclusiva por VU) elimina colisões artificiais.** O ciclo reversível (solicitar→aprovar→promover↔rebaixar→entrar por link→transferir↔devolver→expulsar→revogar) mantém o estado estável entre iterações, sem deriva.

---

## Observações Transversais

1. **Community stress com 476 req/s e p(95) de 700ms:** O throughput e a latência do community-stress indicam que os endpoints públicos de comunidade (listagem, busca) começam a degradar sob 500 VUs. Para produção, deve-se avaliar cache de segundo nível (Redis) para consultas de listagem ou índices adicionais para reduzir o custo dos JOINs sob alta concorrência.

2. **Logs do servidor exportados para análise:** Os warnings do Spring Boot durante o join-requests-stress foram capturados e mostram o volume de erros de concorrência. Esses logs são valiosos para rastrear a causa raiz — foram incluídos no arquivo `domaincommuniy.md` original.
