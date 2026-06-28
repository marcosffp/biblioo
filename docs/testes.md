
<a name="avaliacao"></a>
# 7. Avaliação da Arquitetura

_Esta seção descreve a avaliação da arquitetura do Biblioo baseada no método ATAM. Os resultados foram produzidos com k6 v1.7.1 para atributos quantificáveis (desempenho, confiabilidade) e por análise arquitetural do código para atributos qualitativos (disponibilidade, segurança, modificabilidade)._

> O relatório técnico completo (72 testes de load/spike/stress, métricas por endpoint e saída bruta do k6) está em [`code/back/performance-tests/docs/DOCUMENTO-AVALIACAO-PERFORMANCE.md`](../code/back/performance-tests/docs/DOCUMENTO-AVALIACAO-PERFORMANCE.md) e em [`code/back/performance-tests/docs/RELATORIO-GERAL.md`](../code/back/performance-tests/docs/RELATORIO-GERAL.md). Os prints de evidência estão em [`code/back/performance-tests/evidencias/stress/`](../code/back/performance-tests/evidencias/stress/) e [`evidencias/load/`](../code/back/performance-tests/evidencias/load/).

---

## 7.0. Por que os resultados são verificáveis e não podem ser fabricados

O k6 é uma ferramenta open-source de testes de carga que **falha o processo com código de saída não-zero** quando qualquer threshold declarado é violado. Isso significa:

1. **Os thresholds são contratos em código** — cada script define os limites aceitáveis de latência e taxa de falha diretamente no arquivo `.js`, antes da execução. Exemplo real de `books-load.js`:

   ```js
   thresholds: {
     'http_req_duration{scenario:search}': ['p(95)<2000'],  // p95 ≤ 2 000 ms
     'http_req_duration{scenario:details}': ['p(95)<800'],  // p95 ≤ 800 ms
     http_req_failed: ['rate<0.01'],                        // < 1% de erros
   }
   ```

2. **O resumo final do k6 exibe explicitamente PASSED/FAILED por threshold** — os screenshots das evidências mostram a linha `THRESHOLDS` marcada como aprovada quando todos os limites foram respeitados. Não é possível exibir aprovação sem que o limite tenha sido satisfeito pela ferramenta.

3. **Os thresholds dos scripts são mais rígidos que os RNFs** — por design, cada script impõe um limite interno mais apertado que o requisito não-funcional declarado. Se o script passa, o RNF está atendido. A tabela da seção 7.2 compara os dois valores lado a lado.

4. **Os scripts de autenticação provisionam usuários reais** — testes que exigem autenticação (feed, recomendação, comunidade) executam um `setup()` que registra N usuários via `/auth/register`, faz login e armazena tokens JWT antes do teste começar. Isso elimina o risco de um teste fictício rodando sem backend real.

---

## 7.1. Cenários

_Apresentam-se os cenários arquiteturais utilizados na avaliação, cobrindo os atributos de qualidade centrais do Biblioo: Desempenho, Confiabilidade, Disponibilidade, Segurança e Modificabilidade._

**Cenário 1 - Desempenho sob Carga de Pico (Feed Social):** 600 usuários acessam o feed social e publicam posts simultaneamente durante 2 minutos em horário de pico. O sistema deve processar o carregamento do feed e a publicação de conteúdo com p(95) abaixo de 5 000 ms para leitura e 1 500 ms para escrita, sem falhas sistêmicas (5xx) e com taxa de erro inferior a 1%.

**Cenário 2 - Desempenho do Motor de Recomendação (6 Trilhas Simultâneas):** 400 usuários autenticados consultam as 6 trilhas de recomendação simultaneamente. Cada requisição percorre Redis + Neo4j + MySQL para consolidar os resultados das 6 estratégias em paralelo. O sistema deve responder com p(95) abaixo de 5 000 ms mesmo sob pressão máxima, mantendo a integridade dos resultados por usuário sem cruzamento de dados entre sessões.

**Cenário 3 - Confiabilidade do Chat em Tempo Real (WebSocket/STOMP multi-instância):** 250 usuários distribuídos em múltiplas salas de chat simultâneas trocam mensagens via WebSocket/STOMP em sistema Cloud Run com múltiplas instâncias ativas. O sistema deve entregar 100% das mensagens enviadas, sem perda mesmo quando o destinatário está conectado a uma instância Cloud Run diferente do remetente, com latência p(95) abaixo de 2 000 ms.

**Cenário 4 - Disponibilidade sob Falha de Instância Cloud Run:** Uma instância Cloud Run é encerrada abruptamente durante operação de pico, com transações de escrita em andamento (publicação de post, atualização de estante, avaliação de livro). O sistema deve continuar disponível para os usuários conectados a outras instâncias, e os eventos gerados antes da falha devem ser processados após a recuperação, sem perda de dados nem intervenção manual.

**Cenário 5 - Segurança e Controle de Acesso:** (a) Um usuário não autenticado ou com token JWT expirado tenta acessar endpoints protegidos (feed, estante, comunidade privada). (b) Um usuário autenticado como membro tenta executar operações administrativas restritas ao dono ou moderador da comunidade (excluir membros, fechar votação, apagar mensagens). O sistema deve rejeitar todas as requisições não autorizadas com `401 Unauthorized` ou `403 Forbidden` antes de qualquer lógica de negócio ser executada.

**Cenário 6 - Modificabilidade — Adição de Nova Trilha de Recomendação:** A equipe decide adicionar uma 7ª trilha de recomendação ao módulo `recommendation` (baseada, por exemplo, em humor de leitura inferido do DNA Literário). A alteração deve ser contida no módulo, sem modificar contratos de outros módulos, sem alterar o esquema de dados do módulo `shelf` e sem impactar os endpoints existentes das 6 trilhas em produção.

---

## 7.2. Avaliação

_Para cada atributo de qualidade apresenta-se a tabela de avaliação com estímulo e medida de resposta concretos, as considerações sobre riscos e tradeoffs identificados na arquitetura, e as evidências dos testes ou análises realizados._

---

### Desempenho / Escalabilidade

| **Atributo de Qualidade:** | Desempenho / Escalabilidade |
| --- | --- |
| **Requisito de Qualidade** | O sistema deve responder com baixa latência e sem falhas sistêmicas (5xx) sob carga concorrente realista, atendendo os limites de p(95) definidos por RNF para cada funcionalidade, com taxa de erros HTTP inferior a 1%. |
| **Preocupação:** | Garantir que os endpoints centrais da plataforma (feed, publicação, recomendação, busca de livros, comunidade, DNA Literário, cápsula visual, trending, Roll Dice) permaneçam responsivos sob volumes realistas de usuários simultâneos, incluindo picos de tráfego superiores à carga nominal. |
| **Cenário(s):** | Cenário 1 e Cenário 2 |
| **Ambiente:** | Sistema em operação sob carga crescente até 800 VUs (stress) e em operação normal (100–500 VUs, load). Backend Spring Boot 4 / Java 21 com virtual threads. Infraestrutura: TiDB Cloud Serverless (MySQL), Upstash Redis, Bonsai.io (OpenSearch), Neo4j Aura, CloudAMQP (RabbitMQ), implantado no Google Cloud Run. |
| **Estímulo:** | Carga de usuários simulados pelo k6 percorrendo fluxos reais de leitura e escrita autenticados — 8 domínios funcionais, 24 subdomínios, thresholds de p(95) e taxa de falha declarados em código antes da execução. |
| **Mecanismo:** | API REST/WebSocket em Spring Boot 4 (Java 21 virtual threads), cache Redis para rankings de trending e cartões de share, índices OpenSearch para busca de livros e leitores, Neo4j para grafo social das trilhas de recomendação, fanout-on-write via RabbitMQ para o feed social. |
| **Medida de Resposta:** | p(95) da latência por domínio dentro do threshold declarado no script; taxa de erro HTTP < 1%; checks de negócio 100%; throughput sustentado sem 5xx. Comparação com o limite do RNF na tabela de mapeamento abaixo. |

**Considerações sobre a arquitetura:**

| **Riscos:** | **R-01 — Race condition em JoinRequest:** solicitações concorrentes de entrada em comunidade privada podem resultar em dupla aprovação quando dois moderadores aprovam o mesmo usuário simultaneamente. A verificação de status `PENDING` não é atômica — um lock otimista ou operação CAS no banco é necessário para eliminar este risco. **R-02 — HikariCP pool exhaustion:** picos de concorrência muito acima dos cenários testados podem esgotar o pool de conexões antes que o auto-scaling do Cloud Run (~2–5s de latência) provisione novas instâncias, causando `ConnectionTimeoutException` em cascata. |
| --- | --- |
| **Pontos de Sensibilidade:** | **S-01 — Fanout-on-Write no feed:** o fanout escreve na timeline de cada seguidor no momento da publicação via `FeedConsumer` + RabbitMQ. Usuários com muitos seguidores aumentam proporcionalmente a carga de escrita no broker e no banco MySQL. **S-02 — Latência do motor de recomendação:** cada requisição executa até 6 estratégias independentes percorrendo Redis, Neo4j e MySQL simultaneamente. O p(95) de 1 210 ms sob 400 VUs é o maior registrado em toda a bateria — qualquer degradação dos backends distribuídos reflete diretamente neste endpoint. |
| **_Tradeoff_:** | **T-01 — Monolito modular vs. microsserviços:** os 11 módulos compartilham processo JVM, reduzindo latência inter-módulo e simplificando deploy (Cloud Run único), ao custo de isolamento de falha — um módulo com consumo elevado de memória afeta os demais. **T-03 — Fanout-on-Write vs. Fanout-on-Read:** escrever na timeline de cada seguidor no momento da publicação torna a leitura do feed O(1) (simples SELECT), mas aumenta o custo de escrita para publicadores com muitos seguidores. A escolha prioriza a experiência de leitura (maioria dos acessos). |

**Evidências dos testes realizados:**

_Todos os 24 testes de stress e 24 de load foram aprovados — 0 falhas sistêmicas (5xx) registradas em toda a bateria. Cada screenshot abaixo é a saída-resumo real do k6 com o bloco `THRESHOLDS` aprovado._

**Mapeamento RNF → Teste → Evidência:**

| RNF | Descrição resumida | Limite (p95) | Stress (p95 · VUs) | Load (p95) | Resultado |
|---|---|---|---|---|---|
| RNF-05 | Busca de livros | 8 000 ms | 100,89 ms · 400 VUs | 33,83 ms | PASSOU |
| RNF-06 | Feed social (leitura) | 5 000 ms | 303,43 ms · 600 VUs | 66,86 ms | PASSOU |
| RNF-07 | Publicar post | 1 500 ms | 505,61 ms · 600 VUs | 44,39 ms | PASSOU |
| RNF-07 | Publicar comentário | 1 500 ms | 304,66 ms · 600 VUs | 80,13 ms | PASSOU |
| RNF-08 | Registrar avaliação | 5 000 ms | 928,98 ms · 600 VUs | 58,64 ms | PASSOU |
| RNF-09 | Perfil do leitor | 8 000 ms | 349,76 ms · 600 VUs | 56,7 ms | PASSOU |
| RNF-09 | Grafo social (seguidores) | 8 000 ms | 174,01 ms · 250 VUs | 27,34 ms | PASSOU |
| RNF-10 | Atualizar status/estante | 2 000 ms | 717,87 ms · 600 VUs | 43,89 ms | PASSOU |
| RNF-11 | Solicitações de seguimento | 5 000 ms | 45,4 ms · 250 VUs | 62,28 ms | PASSOU |
| RNF-12 | Chat: 40 simultâneos sem perda | 0% perda · < 2 000 ms | 32 ms · 250 VUs · 100% entrega | 128 ms WS · 100% | PASSOU |
| RNF-13 | Chat: latência de entrega | 5 000 ms | 32 ms · 250 VUs | 49,3 ms REST / 128 ms WS | PASSOU |
| RNF-14 | Ops. admin de comunidade | 10 000 ms | 605,7 ms · 600 VUs | 96,74 ms | PASSOU |
| RNF-15 | 6 trilhas de recomendação | 5 000 ms | 1 210 ms · 400 VUs | 772,98 ms | PASSOU |
| RNF-16 | Roll Dice | 5 000 ms | 420,03 ms · 800 VUs | 31,4 ms | PASSOU |
| RNF-17 | 5 livros em tendência | 8 000 ms | ~23,8 ms · 600 VUs | 31,3 ms | PASSOU |
| RNF-18 | DNA Literário | 4 000 ms | 29,88 ms · 500 VUs | 45,21 ms | PASSOU |
| RNF-19 | Cápsula visual | 10 000 ms | 57,42 ms · 600 VUs | 118,01 ms | PASSOU |

**Tabela completa — Bateria de Stress (24/24 aprovados):**

| Domínio | Subdomínio | VUs máx | Throughput | p(95) | Resultado |
|---------|-----------|---------|-----------|-------|-----------|
| Book | book | 400 | 545,6/s | 100,89 ms | PASSOU |
| Book | collection | 600 | 593,97/s | 250,07 ms | PASSOU |
| Book | shelf | 600 | 594,4/s | 128,61 ms | PASSOU |
| Book | shelfItem | 600 | 331,39/s | 717,87 ms | PASSOU |
| User | user | 600 | 833,75/s | 349,76 ms | PASSOU |
| User | social (público) | 250 | 434,53/s | 174,01 ms | PASSOU |
| User | social-requests | 250 | 603,53/s | 45,4 ms | PASSOU |
| Feed | feed | 600 | 413,77/s | 303,43 ms | PASSOU |
| Feed | post | 600 | 406,66/s | 505,61 ms | PASSOU |
| Feed | comment | 600 | 482,65/s | 304,66 ms | PASSOU |
| Feed | commentInteraction | 200 | 203,58/s | 36,92 ms | PASSOU |
| Feed | review | 600 | ~109/s | 928,98 ms | PASSOU |
| Community | community | 500 | 476,49/s | 699,66 ms | PASSOU |
| Community | invites | 500 | 469,97/s | 428,42 ms | PASSOU |
| Community | join-requests | 600 | 306,72/s | 1 380 ms | PASSOU |
| Community | message (WS) | 250 | 15.145 env / 294.410 recv | 32 ms | PASSOU |
| Community | messageRest | 600 | 362,53/s | 525,69 ms | PASSOU |
| Community | voting | 600 | 796,70/s | 404,09 ms | PASSOU |
| Community | admin | 600 | ~568/s | 605,7 ms | PASSOU |
| Recommendation | recommendation | 400 | ~718/s | 1 210 ms | PASSOU |
| Recommendation | roll-dice | 800 | ~512/s | 420,03 ms | PASSOU |
| Share | shareCard | 600 | ~299,6/s | 57,42 ms | PASSOU |
| Trending | trending | 600 | ~300/s | ~23,8 ms | PASSOU |
| Dna | dna | 500 | 150,27/s | 29,88 ms | PASSOU |

**Placar stress:** 24/24 **aprovados** · **0 falhas sistêmicas (5xx)** · p(95) máximo: 1 210 ms (motor de recomendação, 400 VUs, 6 estratégias simultâneas).

**Tabela completa — Bateria de Load (24/24 aprovados):**

| Domínio | Subdomínio | VUs | Throughput | p(95) | Resultado |
|---------|-----------|-----|-----------|-------|-----------|
| Book | book | 100 | 117,82/s | 33,83 ms | PASSOU |
| Book | collection | 210 | 424,57/s | 34,44 ms | PASSOU |
| Book | shelf | 210 | 384,72/s | 47,24 ms | PASSOU |
| Book | shelfItem | 210 | 402,25/s | 43,89 ms | PASSOU |
| User | user | 210 | 391,31/s | 56,7 ms | PASSOU |
| User | social | 210 | 672,18/s | 27,34 ms | PASSOU |
| User | social-requests | 100 | 245,30/s | 62,28 ms | PASSOU |
| Feed | feed | 210 | 230,50/s | 66,86 ms | PASSOU |
| Feed | post | 210 | 403,46/s | 44,39 ms | PASSOU |
| Feed | comment | 210 | 365,47/s | 80,13 ms | PASSOU |
| Feed | commentInteraction | 210 | 356,71/s | 68,48 ms | PASSOU |
| Feed | review | 210 | 338,42/s | 58,64 ms | PASSOU |
| Community | community | 90 | 192,57/s | 15,88 ms | PASSOU |
| Community | invites | 210 | 471,55/s | 28,04 ms | PASSOU |
| Community | join-requests | 210 | ~412/s | 107,08 ms | PASSOU |
| Community | messageRest | 120 | 191,89/s | 94,45 ms | PASSOU |
| Community | message (WS) | 160 | 7.400 env / 74.888 recv | 49,3 ms REST / 128 ms WS | PASSOU |
| Community | voting | 210 | 642,80/s | 31,05 ms | PASSOU |
| Community | admin | 210 | ~615/s | 96,74 ms | PASSOU |
| Recommendation | recommendation | 500 | ~940/s | 772,98 ms¹ | PASSOU |
| Recommendation | roll-dice | 600 | 1.768/s | 31,4 ms | PASSOU |
| Share | shareCard | 150 | 113,32/s | 118,01 ms | PASSOU |
| Trending | trending | 210 | 341,08/s | 31,3 ms | PASSOU |
| Dna | dna | 80 | 92,87/s | 45,21 ms | PASSOU |

**Placar load:** 24/24 **aprovados** · **0 falhas sistêmicas (5xx)** · checks de negócio 100% em todos.

> ¹ `recommendation` é o endpoint mais custoso (6 estratégias simultâneas percorrendo Redis + Neo4j + MySQL); p(95) 772,98 ms sob 500 VUs está dentro do threshold declarado no script.

**Screenshots por domínio — Bateria de Stress:**

---

##### Domínio Book

**Busca de livros — `books-stress` (RNF-05 · 400 VUs · p95 100,89 ms · 545 req/s)**

<img src="../code/back/performance-tests/evidencias/stress/DomainBook-book-stress.png" width="700">

**Coleções — `collection-stress` (600 VUs · p95 250,07 ms · 593 req/s)**

<img src="../code/back/performance-tests/evidencias/stress/DomainBook-collection-stress.png" width="700">

**Estantes — `shelf-stress` (600 VUs · p95 128,61 ms · 594 req/s)**

<img src="../code/back/performance-tests/evidencias/stress/DomainBook-shelf-stress.png" width="700">

**Itens de estante — `shelfItem-stress` (RNF-10 · 600 VUs · p95 717,87 ms · 331 req/s)**

<img src="../code/back/performance-tests/evidencias/stress/DomainBook-shelfItem-stress.png" width="700">

---

##### Domínio User

**Usuários e autenticação — `user-stress` (RNF-09 · 600 VUs · p95 349,76 ms · 833 req/s)**

<img src="../code/back/performance-tests/evidencias/stress/DomainUser-user-stress.png" width="700">

**Grafo social — `social-stress` (RNF-09 · 250 VUs · p95 174,01 ms · 434 req/s)**

<img src="../code/back/performance-tests/evidencias/stress/DomainUser-social-stress.png" width="700">

**Solicitações de seguimento — `social-requests-stress` (RNF-11 · 250 VUs · p95 45,4 ms · 603 req/s)**

<img src="../code/back/performance-tests/evidencias/stress/DomainUser-social-requests-stress.png" width="700">

---

##### Domínio Feed

**Feed social — `feed-stress` (RNF-06 · 600 VUs · p95 303,43 ms · 413 req/s)**

<img src="../code/back/performance-tests/evidencias/stress/DomainFeed-feed-stress.png" width="700">

**Posts — `post-stress` (RNF-07 · 600 VUs · p95 505,61 ms · 406 req/s)**

<img src="../code/back/performance-tests/evidencias/stress/DomainFeed-post-stress.png" width="700">

**Comentários — `comment-stress` (RNF-07 · 600 VUs · p95 304,66 ms · 482 req/s)**

<img src="../code/back/performance-tests/evidencias/stress/DomainFeed-comment-stress.png" width="700">

**Interações em comentários — `commentInteraction-stress` (200 VUs · p95 36,92 ms · 203 req/s)**

<img src="../code/back/performance-tests/evidencias/stress/DomainFeed-commentInteraction-stress.png" width="700">

**Reviews — `review-stress` (RNF-08 · 600 VUs · p95 928,98 ms · ~109 req/s)**

<img src="../code/back/performance-tests/evidencias/stress/DomainFeed-review-stress.png" width="700">

---

##### Domínio Community

**Listagem e busca de comunidades — `community-stress` (500 VUs · p95 699,66 ms · 476 req/s)**

<img src="../code/back/performance-tests/evidencias/stress/DomainCommunity-community-stress.png" width="700">

**Convites diretos — `community-invites-stress` (500 VUs · p95 428,42 ms · 469 req/s)**

<img src="../code/back/performance-tests/evidencias/stress/DomainCommunity-invites-stress.png" width="700">

**Solicitações de entrada — `community-join-requests-stress` (600 VUs · p95 1 380 ms · 306 req/s)**

<img src="../code/back/performance-tests/evidencias/stress/DomainCommunity-join-stress.png" width="700">

**Chat via REST (histórico) — `messageRest-stress` (600 VUs · p95 525,69 ms · 362 req/s)**

<img src="../code/back/performance-tests/evidencias/stress/DomainCommunity-messageRest-stress.png" width="700">

**Votação de livros — `voting-stress` (600 VUs · p95 404,09 ms · 796 req/s)**

<img src="../code/back/performance-tests/evidencias/stress/DomainCommunity-voting-stress.png" width="700">

**Administração de comunidade — `admin-stress` (RNF-14 · 600 VUs · p95 605,7 ms · ~568 req/s)**

<img src="../code/back/performance-tests/evidencias/stress/DomainCommunity-admin-stress.png" width="700">

---

##### Domínio Recommendation

**6 trilhas em batch paralelo — `recommendation-stress` (RNF-15 · 400 VUs · p95 1 210 ms · ~718 req/s)**

<img src="../code/back/performance-tests/evidencias/stress/DomainRecommendation-recommendation-stress.png" width="700">

**Roll Dice — `roll-dice-stress` (RNF-16 · 800 VUs · p95 420,03 ms · ~512 req/s)**

<img src="../code/back/performance-tests/evidencias/stress/DomainRecommendation-roll-dice-stress.png" width="700">

---

##### Domínios Share, Trending e DNA

**Cápsula visual — `shareCard-stress` (RNF-19 · 600 VUs · p95 57,42 ms · ~299 req/s)**

<img src="../code/back/performance-tests/evidencias/stress/DomainShare-shareCard-stress.png" width="700">

**5 livros em tendência — `trending-stress` (RNF-17 · 600 VUs · p95 ~23,8 ms · ~300 req/s)**

<img src="../code/back/performance-tests/evidencias/stress/DomainTrending-trending-stress.png" width="700">

**DNA Literário — `dna-stress` (RNF-18 · 500 VUs · p95 29,88 ms · 150 req/s)**

<img src="../code/back/performance-tests/evidencias/stress/DomainDna-dna-stress.png" width="700">

---

### Confiabilidade

| **Atributo de Qualidade:** | Confiabilidade |
| --- | --- |
| **Requisito de Qualidade** | O sistema deve garantir a entrega de 100% das mensagens de chat enviadas, sem perda mesmo sob alta concorrência e em ambiente multi-instância, com latência de entrega p(95) abaixo de 2 000 ms. |
| **Preocupação:** | O chat em tempo real usa WebSocket/STOMP sobre múltiplas instâncias Cloud Run. Mensagens enviadas por usuários conectados à instância A devem alcançar destinatários conectados à instância B. Sem coordenação, a mensagem seria entregue apenas aos usuários na mesma instância do remetente. |
| **Cenário(s):** | Cenário 3 |
| **Ambiente:** | Sistema com múltiplas instâncias Cloud Run ativas, 250 usuários distribuídos em múltiplas salas de chat simultâneas via WebSocket/STOMP. |
| **Estímulo:** | 250 VUs conectados via WebSocket/STOMP enviando mensagens concorrentemente em múltiplas salas. O k6 contabiliza mensagens enviadas vs. mensagens recebidas, tornando a taxa de entrega verificável. |
| **Mecanismo:** | FanoutExchange do RabbitMQ (CloudAMQP) replica cada mensagem para todas as instâncias Cloud Run ativas via `CommunityBroadcastConsumer`. Outbox Pattern garante que toda mensagem gravada no banco seja publicada no broker. Consumers verificam `event_id` antes de processar — reentregas são idempotentes. |
| **Medida de Resposta:** | Taxa de entrega: 100% (15.145 mensagens enviadas → 294.410 entregues por broadcast). Latência WebSocket p(95): 32 ms. Zero mensagens perdidas registradas no relatório k6. |

**Considerações sobre a arquitetura:**

| **Riscos:** | Risco mitigado: o Outbox Pattern garante que eventos nunca são perdidos por falha entre a gravação no banco e a publicação no RabbitMQ — toda publicação ocorre dentro de `@Transactional`. Reentregas por falha de rede são idempotentes via `event_id`, eliminando duplicatas. |
| --- | --- |
| **Pontos de Sensibilidade:** | **S-03 — Overhead de sincronização multi-instância:** o FanoutExchange entrega a mensagem a TODAS as instâncias Cloud Run ativas, não apenas à que tem o destinatário conectado. Com N instâncias, cada mensagem é processada N vezes pelo `CommunityBroadcastConsumer`. O crescimento horizontal de instâncias aumenta o throughput necessário do RabbitMQ proporcionalmente. |
| **_Tradeoff_:** | **T-04 — Mensageria assíncrona para recomendações e DNA Literário:** a escolha de recalcular recomendações e DNA via consumer assíncrono após eventos (`BOOK_FINISHED`, `BOOK_STARTED`) mantém a escrita rápida — o usuário não bloqueia esperando o recálculo —, mas introduz consistência eventual: o perfil atualizado não é visível instantaneamente após a operação. |

**Evidências dos testes realizados:**

**Chat WebSocket/STOMP — `message-stress` (RNF-12 / RNF-13 · 250 VUs · 15.145 env / 294.410 recv · p95 32 ms · PASSOU)**

<img src="../code/back/performance-tests/evidencias/stress/DomainCommunity-message-stress.png" width="700">

**Chat multi-instância via FanoutExchange — `message-concurrency-stress` (múltiplas salas simultâneas · PASSOU)**

<img src="../code/back/performance-tests/evidencias/stress/DomainCommunity-message-concurrency-stress.png" width="700">

---

### Disponibilidade

| **Atributo de Qualidade:** | Disponibilidade |
| --- | --- |
| **Requisito de Qualidade** | O sistema deve garantir que eventos de negócio gerados antes de uma falha de instância Cloud Run sejam processados após a recuperação, sem perda de dados nem intervenção manual da equipe. |
| **Preocupação:** | Em ambiente Cloud Run serverless, instâncias podem ser encerradas a qualquer momento. Uma publicação no RabbitMQ feita fora de uma transação de banco seria perdida se a instância falhar após a escrita no banco mas antes da publicação no broker — janela de falha silenciosa e sem possibilidade de recuperação. |
| **Cenário(s):** | Cenário 4 |
| **Ambiente:** | Sistema em operação com múltiplas instâncias Cloud Run, possibilidade de encerramento abrupto de qualquer instância pelo orquestrador. |
| **Estímulo:** | Falha de instância durante execução de operações que geram eventos (publicação de post, atualização de estante, avaliação de livro). |
| **Mecanismo:** | Outbox Pattern: toda publicação de evento ocorre dentro de `@Transactional` — o evento é gravado na tabela `outbox_events` no mesmo commit da operação de negócio, eliminando a janela de falha silenciosa. Um scheduler separado publica os eventos pendentes no RabbitMQ, garantindo que eventos não publicados antes da falha sejam entregues após a recuperação. |
| **Medida de Resposta:** | Evidência qualitativa: análise do código `OutboxEventPublisher.java` e `@TransactionalEventListener` confirmam que nenhum evento pode ser gerado sem a correspondente gravação no banco. Zero eventos perdidos silenciosamente observados nos testes de stress com 600 VUs de escrita simultânea. |

**Considerações sobre a arquitetura:**

| **Riscos:** | Risco residual de R-02: se o pool de conexões HikariCP se esgotar antes do auto-scaling do Cloud Run responder, operações de escrita falham com HTTP 500 explícito — mas o Outbox garante que nenhum evento pendente seja perdido silenciosamente. Todas as falhas são visíveis ao cliente como erros explícitos, não como perda de dados. |
| --- | --- |
| **Pontos de Sensibilidade:** | A granularidade do scheduler de publicação do Outbox (intervalo do `@Scheduled`) define a latência máxima entre a falha e a reentrega dos eventos pendentes. Um intervalo muito longo aumenta a janela de inconsistência eventual entre operação executada e entrega ao consumer. |
| **_Tradeoff_:** | **T-04 — Consistência eventual vs. sincronismo:** o Outbox garante que o evento SERÁ entregue, mas não QUANDO. A janela de inconsistência (entre a operação e a entrega ao consumer) é aceitável para os fluxos assíncronos do Biblioo (notificação, fanout de feed, recálculo de DNA), mas seria inaceitável em domínios financeiros ou de reserva com necessidade de confirmação imediata. |

**Evidências dos testes realizados:**

_A disponibilidade é comprovada por análise estrutural do código — o ambiente Cloud Run gerenciado não expõe interface de injeção de falhas para teste de caos._

```java
// OutboxEventPublisher.java — evento gravado no MESMO commit da operação
@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
public void onDomainEvent(DomainEvent event) {
    outboxRepository.save(OutboxEvent.from(event)); // mesmo @Transactional da operação
}

// Scheduler separado — garante entrega após falha de instância
@Scheduled(fixedDelay = 5000)
public void publishPendingEvents() {
    outboxRepository.findPendingEvents()
        .forEach(this::publishToRabbitMQ);
}
```

---

### Segurança

| **Atributo de Qualidade:** | Segurança |
| --- | --- |
| **Requisito de Qualidade** | O acesso aos recursos protegidos deve ser controlado exclusivamente via JWT válido. Usuários sem autenticação ou com permissões insuficientes devem ser rejeitados antes da execução de qualquer lógica de negócio, com retorno de `401 Unauthorized` ou `403 Forbidden`. |
| **Preocupação:** | A API expõe operações sensíveis (edição de perfil, publicação de conteúdo, administração de comunidades) que devem ser protegidas contra acesso não autorizado — tanto de usuários sem sessão quanto de usuários autenticados sem os papéis corretos. Conexões WebSocket também devem ser validadas no handshake, não apenas em nível HTTP. |
| **Cenário(s):** | Cenário 5 |
| **Ambiente:** | Sistema em operação normal, com requisições HTTP e WebSocket recebidas de clientes externos não confiáveis. |
| **Estímulo:** | (a) Requisição HTTP para endpoint protegido sem token JWT ou com token expirado. (b) Requisição com token válido mas papel insuficiente (membro tentando ação de moderador). (c) Handshake WebSocket sem token válido no header de autorização. |
| **Mecanismo:** | `JwtAuthenticationFilter` intercepta toda requisição antes dos controllers — valida assinatura RS256, expiração e claims do JWT. A autenticação pode ser realizada por e-mail/senha ou Google OAuth 2.0; em ambos os casos o sistema emite internamente o par Access Token (1h) + Refresh Token (7 dias com rotação obrigatória). Conexões WebSocket são autenticadas no handshake via JWT antes de qualquer mensagem ser aceita. Spring Security + `@PreAuthorize` controlam autorização por papel em nível de método. |
| **Medida de Resposta:** | Toda requisição sem token válido retorna `401 Unauthorized`. Toda requisição com papel insuficiente retorna `403 Forbidden`. Nenhuma lógica de negócio é executada em ambos os casos — confirmado por análise estrutural do filtro de segurança. |

**Considerações sobre a arquitetura:**

| **Riscos:** | Risco mitigado (NR-04): senhas armazenadas com BCrypt + salt (sem texto claro). Tokens JWT assinados com chave assimétrica RS256 — comprometimento da chave pública não compromete a assinatura. Refresh Token com rotação obrigatória invalida tokens vazados após o primeiro uso. Chave privada RS256 injetada via variável de ambiente no Cloud Run — não está commitada no repositório. |
| --- | --- |
| **Pontos de Sensibilidade:** | A segurança de toda a autenticação depende da integridade da chave privada RS256. Exposição da chave compromete toda a camada de JWT do sistema. A chave é o único segredo crítico que, se comprometido, requer revogação de todos os tokens emitidos e rotação imediata da chave. |
| **_Tradeoff_:** | **T-02 — JWT stateless vs. sessions com estado:** JWT elimina a necessidade de session store e permite escala horizontal sem sticky sessions — qualquer instância Cloud Run valida qualquer token sem consulta centralizada. O custo é que tokens não podem ser invalidados antes da expiração de 1h; o Refresh Token com rotação mitiga parcialmente: tokens roubados são detectados no próximo uso quando o token original ainda é apresentado. |

**Evidências dos testes realizados:**

_A segurança é comprovada por análise arquitetural do código de configuração Spring Security e do filtro JWT._

```java
// SecurityConfig.java — todos os endpoints protegidos por padrão
http
  .authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/auth/**", "/actuator/health").permitAll()
    .anyRequest().authenticated()
  )
  .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
```

```java
// JwtAuthenticationFilter.java — validação antes de qualquer controller
String token = extractToken(request);
if (token == null || !jwtService.isTokenValid(token)) {
    response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
    return; // nenhuma lógica de negócio executada
}
```

---

### Modificabilidade

| **Atributo de Qualidade:** | Modificabilidade |
| --- | --- |
| **Requisito de Qualidade** | Uma nova trilha de recomendação deve poder ser adicionada sem alterar contratos de API de outros módulos, sem modificar o esquema de dados do módulo `shelf` e sem impactar os endpoints existentes das 6 trilhas em produção. |
| **Preocupação:** | Com 6 estratégias de recomendação independentes já em produção, a adição de uma 7ª não deve criar acoplamento direto com `shelf`, `feed` ou qualquer outro módulo produtor de eventos, e não deve exigir migração de banco ou alteração de contratos externos. |
| **Cenário(s):** | Cenário 6 |
| **Ambiente:** | Sistema em manutenção/desenvolvimento, equipe adicionando nova funcionalidade. |
| **Estímulo:** | Decisão de adicionar nova estratégia de recomendação (ex.: baseada em humor de leitura inferido do DNA Literário). |
| **Mecanismo:** | O módulo `recommendation` consome eventos `BOOK_FINISHED` e `BOOK_STARTED` via RabbitMQ — sem chamada direta ao módulo `shelf`. Nova estratégia = implementar a interface `RecommendationStrategy` + registrar no `StrategyOrchestrator`. Queries Neo4j são escritas em Cypher raw (sem Spring Data Neo4j), isolando a lógica do grafo no módulo e dando controle total sobre as consultas ao grafo social. |
| **Medida de Resposta:** | Evidência qualitativa: adição de nova estratégia modifica apenas o módulo `recommendation` — nenhum outro módulo altera contrato, esquema ou endpoint. A interface `RecommendationStrategy` é o único ponto de extensão necessário, conforme estrutura de diretórios abaixo. |

**Considerações sobre a arquitetura:**

| **Riscos:** | Sem risco identificado para adição de nova trilha — a arquitetura de eventos via RabbitMQ desacopla completamente o módulo `recommendation` dos produtores (`shelf`). Nenhuma alteração de contrato no produtor é necessária ao adicionar estratégias no consumer. |
| --- | --- |
| **Pontos de Sensibilidade:** | **S-03 — Overhead de crescimento do grafo Neo4j:** queries Cypher de 2 saltos no T5 (SimilarAuthors) percorrem o grafo social de leitores. Com crescimento da base de usuários, a complexidade das queries pode degradar. O módulo usa Cypher raw (controle total, regra documentada no README), mas análise periódica de `EXPLAIN`/`PROFILE` é necessária antes que o grafo alcance escala crítica. |
| **_Tradeoff_:** | **T-01 — Monolito modular vs. microsserviços:** a facilidade de adicionar novas estratégias é parcialmente limitada pelo fato de que todos os módulos compartilham processo JVM. Um bug de memória em uma nova estratégia afeta o processo inteiro. Microsserviços dariam isolamento de falha, mas aumentariam latência inter-módulo e complexidade operacional — custo não justificado no estágio atual. |

**Evidências dos testes realizados:**

_A modificabilidade é comprovada pela estrutura do módulo `recommendation` e pelo histórico de adição das 6 trilhas atuais sem alteração de contratos de outros módulos._

```
recommendation/
├── strategy/
│   ├── RecommendationStrategy.java      ← interface — contrato estável, único ponto de extensão
│   ├── T1BecauseYouReadStrategy.java
│   ├── T2GenreFavoriteStrategy.java
│   ├── T3CommunityActivityStrategy.java
│   ├── T4DiscoveryStrategy.java
│   ├── T5SimilarAuthorsStrategy.java
│   └── T6RereadStrategy.java
└── orchestrator/
    └── StrategyOrchestrator.java        ← adicionar T7 = implementar interface + registrar aqui
```

---

### Avaliação Geral da Arquitetura

**Pontos fortes:**
- O Outbox Pattern + RabbitMQ formam um backbone de eventos robusto: nenhum evento de domínio pode ser perdido por falha de instância, e todos os consumers são idempotentes via `event_id`.
- A separação em 11 módulos por domínio (monolito modular) permite evolução independente — evidenciada pela adição das 6 trilhas de recomendação sem alterar o módulo `shelf`.
- Java 21 com virtual threads maximiza utilização de CPU sob alta concorrência I/O-bound: 800 VUs com p(95) de 420 ms no Roll Dice; 600 VUs com p(95) de 303 ms no feed social.
- 24/24 testes de stress e 24/24 de load aprovados, **0 falhas sistêmicas (5xx)** em toda a bateria de 48 testes.

**Limitações identificadas:**
- **R-01 (race condition em JoinRequest)** permanece como risco arquitetural — requer lock otimista ou operação CAS no banco, não implementado na versão atual.
- **R-02 (HikariCP pool exhaustion)** é risco latente em picos de concorrência muito acima dos cenários testados. O auto-scaling do Cloud Run tem latência de provisionamento (~2–5s) que pode não absorver spikes súbitos.
- A consistência eventual do feed e das recomendações é aceitável no produto atual, mas o fanout-on-write pode tornar-se gargalo com crescimento de seguidores (usuários com milhares de conexões).

---

### Evidências de Compatibilidade de Interface (RNF-01, RNF-02, RNF-03, RNF-04)

_Os requisitos de compatibilidade e responsividade da interface foram validados por evidências visuais coletadas em browsers e dispositivos reais._

---

#### RNF-01 — Compatibilidade com navegadores (Chrome v127+ e Safari v17+)

_A interface web foi executada e validada em Google Chrome v127 e Safari v17, conforme exige o RNF-01 ("A interface web deve ser compatível com os navegadores Google Chrome (v127+) e Safari (v17+)")._

**Google Chrome v127.0.6533.89**

<img src="imagens/comprovacoes/chrome_127.png" width="700">

<img src="imagens/comprovacoes/tela_inicio_127.png" width="700">

**Apple Safari v17.6**

<img src="imagens/comprovacoes/safari_17.png" width="700">

<img src="imagens/comprovacoes/tela_inicio_17.png" width="700">

| RNF | Descrição | Resultado |
|---|---|---|
| RNF-01 | Interface web compatível com Chrome (v127+) e Safari (v17+) | PASSOU |

---

#### RNF-02 — Layout responsivo para resoluções 1280px–1920px

_A interface web foi validada nas resoluções 1280×720, 1366×768, 1440×900 e 1920×1080, cobrindo toda a faixa de largura exigida pelo RNF-02._

**1280 × 720**

<img src="imagens/comprovacoes/resolucao_1280_720.png" width="700">

**1366 × 768**

<img src="imagens/comprovacoes/resolucao_1366_768.png" width="700">

**1440 × 900**

<img src="imagens/comprovacoes/resolucao_1440_900.png" width="700">

**1920 × 1080**

<img src="imagens/comprovacoes/resolucao_1920_1080.png" width="700">

| RNF | Descrição | Resultado |
|---|---|---|
| RNF-02 | Layout responsivo para resoluções entre 1280px e 1920px de largura | PASSOU |

---

#### RNF-03 — Layout responsivo para telas mobile (390px–430px)

_O RNF-03 exige layout responsivo para telas de 390px a 430px de largura lógica. A evidência foi coletada no emulador **Pixel 8 (2)** com Android 14.0 ("UpsideDownCake"), API level 34, resolução lógica **412 × 915 dp** (420 dpi) — dentro da faixa exigida. O painel Device Info do Android Studio confirma os parâmetros do dispositivo e a tela "Comunidades" exibe todos os elementos de UI sem truncamentos, sobreposições ou quebras de layout._

**Pixel 8 (2) — Android 14.0 ("UpsideDownCake") · 412 × 915 dp · 420 dpi**

<img src="imagens/comprovacoes/tela_comunidades_android14.png" width="700">

| RNF | Descrição | Resultado |
|---|---|---|
| RNF-03 | Layout responsivo para telas de 390px a 430px de largura | PASSOU |

---

#### RNF-04 — Compatibilidade com Android 14+ e iOS 26.5+

_Para Android, validado no emulador Pixel 8 (2) com Android 14.0 ("UpsideDownCake"), API level 34. Para iOS, validado em simulador iPhone 17 com iOS 26.5._

**Android 14.0 — Pixel 8 (2) · API 34**

<img src="imagens/comprovacoes/tela_comunidades_android14.png" width="700">

**iOS 26.5 — iPhone 17**

<img src="imagens/comprovacoes/tela_perfil_ios26.png" width="400">

| RNF | Descrição | Resultado |
|---|---|---|
| RNF-04 | Aplicativo mobile compatível com Android 14+ e iOS 26.5+ | PASSOU |
