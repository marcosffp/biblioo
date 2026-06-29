# Documento de Avaliação — Testes de Performance do Backend Biblioo

> **Projeto:** Biblioo — Rede social literária
> **Módulo avaliado:** Backend (API REST + WebSocket), Spring Boot 4 / Java 25
> **Ferramenta de teste:** [k6](https://k6.io) (Grafana) v1.7.1
> **Tipo de evidência:** prints da saída-resumo do k6 ao final de cada execução
> **Data da bateria de evidências:** 2026-06-24
> **Responsável:** Equipe TI5 — Biblioo

---

## 1. Objetivo

Este documento avalia o comportamento do backend do Biblioo sob carga, comprovado por **evidências visuais (prints)** da execução real dos testes de performance. O objetivo é responder a três perguntas:

1. **O backend aguenta carga realista** sem degradar a experiência do usuário?
2. **Onde estão os limites e os gargalos** de cada domínio funcional?
3. **A aplicação é estável** (ausência de erros sistêmicos) sob concorrência alta?

A suíte completa de performance do projeto contém **1 testes** (load, spike e stress) distribuídos em **8 domínios**. Este documento de avaliação concentra a **evidência fotográfica na bateria de _load_** — o cenário mais representativo do uso real em produção — com **24 testes de carga**, um por subdomínio. Os resultados de _spike_ e _stress_ são referenciados a partir dos relatórios técnicos da suíte (`RELATORIO-GERAL.md` e `RELATORIO-<DOMAIN>.md`).

---

## 2. Metodologia

### 2.1 Tipos de teste

| Tipo | O que simula | Como mede |
|------|--------------|-----------|
| **Load** (carga) | Uso realista e **sustentado** por um período (ex.: 210 usuários simultâneos por 2 min) | Latência e taxa de erro em regime estável |
| **Spike** (pico) | Um **pico abrupto** de acessos (ex.: salto para 500 usuários em segundos) | Resiliência a picos súbitos de tráfego |
| **Stress** | **Rampa crescente** de carga até saturar o sistema (até 600–800 usuários) | Ponto de quebra e comportamento sob saturação |

> Esta avaliação documenta com prints a bateria de **load**. Spike e stress integram a suíte e estão registrados nos relatórios técnicos.

### 2.2 Conceitos do k6

- **VU (Virtual User):** usuário virtual que executa o roteiro de teste em loop, simulando um cliente real.
- **`http_req_duration` p(95):** o percentil 95 do tempo de resposta — 95% das requisições foram **mais rápidas** que esse valor. É a principal métrica de latência (mais honesta que a média, pois captura a cauda).
- **`http_req_failed`:** percentual de requisições com falha HTTP (respostas inesperadas). Mede estabilidade.
- **Throughput (reqs/s):** requisições processadas por segundo — capacidade de vazão.
- **Checks:** validações de negócio por requisição (status correto, corpo esperado etc.). **100% de checks** = todas as respostas foram funcionalmente corretas.
- **Thresholds:** critérios de aprovação/reprovação (SLA). Ex.: `p(95) < 1500ms` e `taxa de falha < 1%`. Quando todos passam, o k6 marca o teste em **verde (✓)**.

### 2.3 Critério de aprovação

Um teste de load é considerado **aprovado** quando **todos os thresholds configurados passam** (✓ verde no print). Cada teste define thresholds específicos por endpoint, calibrados ao custo da operação (uma busca simples exige p95 baixo; o motor de recomendação, que percorre o grafo social, admite p95 maior).

### 2.4 Como as evidências (prints) foram geradas

Cada print é a **saída-resumo real do k6** ao final da execução. A maioria foi capturada com a ferramenta [`freeze`](https://github.com/charmbracelet/freeze) (Charmbracelet), que renderiza a saída de um comando de terminal em PNG — a evidência é gerada **automaticamente pela própria execução**. Alguns prints foram obtidos por **captura de tela manual** do terminal, mantendo o mesmo bloco final de **THRESHOLDS** + **TOTAL RESULTS** como conteúdo da evidência.

**Pré-requisitos:** backend no ar em `localhost:8080`, `k6` e `freeze` instalados, e o comando executado a partir do diretório `code/back`.

**Padrão de comando** (substitua `<CAMINHO_DO_TESTE>` e `<NOME_DA_SAÍDA>`):

```bash
freeze --execute "k6 run --quiet --log-output=none <CAMINHO_DO_TESTE>" \
  -o performance-tests/evidencias/<NOME_DA_SAÍDA>.png \
  --window --padding 30 --shadow.blur 20 --execute.timeout 8m
```

**Exemplo concreto** (gera o print do `user-load`):

```bash
freeze --execute "k6 run --quiet --log-output=none performance-tests/DomainUser/user/user-load.js" \
  -o performance-tests/evidencias/DomainUser-user-load.png \
  --window --padding 30 --shadow.blur 20 --execute.timeout 8m
```

**O que cada parte faz:**

| Trecho | Função |
|--------|--------|
| `--execute "k6 run ..."` | o `freeze` executa o comando e captura sua saída |
| `--quiet --log-output=none` | silencia a barra de progresso e os logs do k6, deixando no print apenas o bloco final de **THRESHOLDS** + **TOTAL RESULTS** |
| `-o .../<NOME>.png` | arquivo de imagem de saída (padrão de nome: `<Domain>-<subdomínio>-load.png`) |
| `--window --padding 30 --shadow.blur 20` | apenas estética (moldura de janela, margem e sombra) |
| `--execute.timeout 8m` | tempo máximo de execução — necessário porque alguns testes têm `setup` longo (criação de centenas de usuários/comunidades) |

> Os 24 prints referenciados neste documento estão em `performance-tests/evidencias/load/`.

---

## 3. Ambiente de execução

| Item | Configuração |
|------|--------------|
| **Máquina de teste** | Apple M3 Pro · 11 núcleos · 18 GB RAM · macOS 26.5.1 |
| **Aplicação** | Spring Boot 4 / Java 25, executando localmente (`localhost:8080`) |
| **Banco relacional** | MySQL 8.4 (Docker) |
| **Cache** | Redis 7.4 (Docker) |
| **Mensageria** | RabbitMQ 4.0 (Docker) |
| **Busca** | OpenSearch 2.18 (Docker) |
| **Grafo social** | Neo4j 5.18 (Docker) |
| **Gerador de carga** | k6 v1.7.1 |

> **Nota de ambiente:** os testes rodaram em máquina única, com a aplicação e toda a infraestrutura competindo pelos mesmos recursos da máquina de teste. Em produção (Google Cloud Run + provedores gerenciados), cada serviço é isolado e escalável — portanto os números aqui representam um **piso conservador** de desempenho, não o teto.

---

## 4. Resultados por domínio

Cada subdomínio abaixo traz a **tabela de métricas** transcrita do print e o **print da execução** como evidência. Salvo indicação, todos os testes foram **aprovados** (thresholds ✓, 0% de falhas, checks 100%).

### 4.1 DomainBook — Catálogo, coleções e prateleiras

CRUD do catálogo de livros, coleções, prateleiras (`shelf`) e itens de prateleira (`shelfItem`).

| Subdomínio | VUs | Requests | Throughput | p(95) | Falhas | Checks | Resultado |
|------------|-----|----------|-----------|-------|--------|--------|-----------|
| book       | 100 | 14.160 | 117,8/s | 33,8ms | 0% | 100% | Aprovado |
| collection | 210 | 57.031 | 424,6/s | 34,4ms | 0% | 100% | Aprovado |
| shelf      | 210 | 50.980 | 384,7/s | 47,2ms | 0% | 100% | Aprovado |
| shelfItem  | 210 | 54.130 | 402,25/s | 43,9ms | 0% | 100% | Aprovado |

> **Nota (book):** o teste combina busca textual (OpenSearch) e detalhe de livro (`GET /books/{id}`). O endpoint de detalhe aceita **404** como resposta válida (livro inexistente); nesta execução, com o catálogo de livros populado, todos os IDs sorteados existiam, resultando em 0% de falha. Ver §6.2.

**Análise:** catálogo estável e rápido. Mesmo a busca textual (OpenSearch) mantém p95 < 50ms. CRUD de prateleiras/coleções escala linearmente até 210 VUs sem degradação.

<img src="../evidencias/load/DomainBook-books-load.png" width="700">
<img src="../evidencias/load/DomainBook-collection-load.png" width="700">
<img src="../evidencias/load/DomainBook-shelf-load.png" width="700">
<img src="../evidencias/load/DomainBook-shelfItem-load.png" width="700">

---

### 4.2 DomainUser — Perfil, autenticação e grafo social

Registro/login (JWT), perfil público e o grafo social (seguir/seguidores e solicitações privadas de amizade).

| Subdomínio | VUs | Requests | Throughput | p(95) | Falhas | Checks | Resultado |
|------------|-----|----------|-----------|-------|--------|--------|-----------|
| user            | 210 | 51.960 | 391,3/s | 56,7ms | 0% | 100% | Aprovado |
| social          | 210 | 89.682 | 672,2/s | 27,3ms | 0% | 100% | Aprovado |
| social-requests | 100 | 32.400 | 245,3/s | 62,3ms | 0% | 100% | Aprovado |

**Análise:** o grafo social (Neo4j) entrega o **maior throughput de leitura** da bateria de load (672 reqs/s no `social`, p95 27ms) — seguir/listar seguidores é muito eficiente. Autenticação e perfil ficam em p95 ~57ms, ótimo para operações que envolvem hashing de senha e emissão de JWT.

<img src="../evidencias/load/DomainUser-user-load.png" width="700">
<img src="../evidencias/load/DomainUser-social-load.png" width="700">
<img src="../evidencias/load/DomainUser-social-requests-load.png" width="700">

---

### 4.3 DomainFeed — Feed, posts, comentários e reviews

Linha do tempo (feed), posts, comentários, interações com comentários (curtir/responder) e reviews de livros.

| Subdomínio | VUs | Requests | Throughput | p(95) | Falhas | Checks | Resultado |
|------------|-----|----------|-----------|-------|--------|--------|-----------|
| feed                | 210 | 30.567 | 230,5/s | 66,9ms | 0% | 100% | Aprovado |
| post                | 210 | 54.013 | 403,5/s | 44,4ms | 0% | 100% | Aprovado |
| comment             | 210 | 51.158 | 365,5/s | 80,1ms | 0% | 100% | Aprovado |
| commentInteraction  | 210 | 51.207 | 356,7/s | 68,5ms | 0% | 100% | Aprovado |
| review              | 210 | 51.913 | 338,4/s | 58,6ms | 0% | 100% | Aprovado |

**Análise:** todos os subdomínios sociais de conteúdo mantêm p95 < 81ms sob 210 VUs, **com operações de escrita** (criar post/comentário/review) misturadas às leituras. O `review` — que cada iteração cria prateleira + livro + review — passou com folga (p95 59ms), confirmando que a lentidão observada em baterias antigas era contaminação de banco, não gargalo de código.

<img src="../evidencias/load/DomainFeed-feed-load.png" width="700">
<img src="../evidencias/load/DomainFeed-post-load.png" width="700">
<img src="../evidencias/load/DomainFeed-comment-load.png" width="700">
<img src="../evidencias/load/DomainFeed-commentInteraction-load.png" width="700">
<img src="../evidencias/load/DomainFeed-review-load.png" width="700">

---

### 4.4 DomainCommunity — Comunidades, mensagens, enquetes e administração

O domínio mais rico: comunidades, convites, solicitações de entrada, mensagens REST e via **WebSocket/STOMP**, enquetes (voting) e operações administrativas.

| Subdomínio | VUs | Requests | Throughput | p(95) | Falhas | Checks | Resultado |
|------------|-----|----------|-----------|-------|--------|--------|-----------|
| community       | 90  | 25.326 | 192,57/s | 15,9ms | 0% | 100% | Aprovado |
| invites         | 210 | 62.321 | 471,55/s | 28,0ms | 0% | 100% | Aprovado |
| join-requests   | 210 | 54.607 | ~412/s | 107,1ms | 0% | 100% | Aprovado |
| messageRest     | 120 | 29.092 | 191,89/s | 94,5ms | 0% | 100% | Aprovado |
| message (WS)    | 160 | 8.052 (HTTP) | — | 49,3ms / entrega 128ms | 0% | 100%² | Aprovado |
| voting          | 210 | 82.760 | 642,80/s | 31,05ms | 0,90%³ | 100% | Aprovado |
| admin           | 210 | 86.935 | ~615/s | 96,74ms | 0% | 100% | Aprovado |

> ² `message` é WebSocket/STOMP: **taxa de entrega de mensagens 100%**, latência de entrega p95 128ms, 7.400 mensagens enviadas / 74.888 recebidas (fan-out de broadcast — cada mensagem enviada é replicada a todos os membros conectados da comunidade).

**Análise:** o domínio escala bem. Operações de leitura (community, invites, voting) ficam em p95 < 32ms. Mesmo o `admin`, que executa um ciclo administrativo completo state-mutating (papel, transferência, expulsão, convite por link), sustenta ~615 reqs/s a 210 VUs com 0% de falha. O `message` via WebSocket entrega 100% das mensagens com latência baixa.

<img src="../evidencias/load/DomainCommunity-community-load.png" width="700">
<img src="../evidencias/load/DomainCommunity-community-invites-load.png" width="700">
<img src="../evidencias/load/DomainCommunity-community-join-requests-load.png" width="700">
<img src="../evidencias/load/DomainCommunity-messageRest-load.png" width="700">
<img src="../evidencias/load/DomainCommunity-message-load.png" width="700">
<img src="../evidencias/load/DomainCommunity-voting-load.png" width="700">
<img src="../evidencias/load/DomainCommunity-admin-load.png" width="700">

---

### 4.5 DomainRecommendation — Motor de recomendação e roll-dice

Motor de recomendação (6 estratégias combinando grafo social + histórico de leitura) e `roll-dice` (sugestão aleatória rápida).

| Subdomínio | VUs | Requests | Throughput | p(95) | Falhas | Checks | Resultado |
|------------|-----|----------|-----------|-------|--------|--------|-----------|
| recommendation | 500 | 148.326 | ~940/s | 772,98ms⁴ | 0% | 100% | Aprovado |
| roll-dice      | 600 | 264.617 | 1.768/s | 31,4ms | 0% | 100% | Aprovado |

> ⁴ `recommendation` é **custoso por design**: cada iteração avalia 6 estratégias (because-you-read, favorite-genre, similar-authors, trending-in-communities etc.), cada uma com joins no grafo social e no histórico. p95 772,98ms sob **500 VUs** é aceitável para o endpoint mais pesado do sistema, e o throughput de ~940 reqs/s é o maior da bateria de load.

**Análise:** o motor de recomendação é o endpoint mais pesado e, ainda assim, não falha sob 500 VUs. Já o `roll-dice`, por ser consulta aleatória simples, é o endpoint de **maior throughput de toda a bateria de load**: **1.768 reqs/s** a 600 VUs com p95 de apenas 31,4ms e 0% de falhas — o contraste com o `recommendation` ilustra bem o custo das 6 estratégias de recomendação.

<img src="../evidencias/load/DomainRecommendation-recommendation-load.png" width="700">
<img src="../evidencias/load/DomainRecommendation-roll-dice-load.png" width="700">

---

### 4.6 DomainShare — ShareCard (cartão compartilhável)

Geração de cartão PNG compartilhável (render Java2D), com cache no Redis por usuário.

| Subdomínio | VUs | Requests | Throughput | p(95) | Falhas | Checks | Resultado |
|------------|-----|----------|-----------|-------|--------|--------|-----------|
| shareCard | 150 | 17.159 | 113,3/s | 118,0ms | 0% | 100% | Aprovado |

**Análise:** a primeira requisição de cada usuário executa o render real (Java2D/`BufferedImage`); as demais são cache hit no Redis. Mesmo incluindo renders reais, o p95 fica em 118ms e o teste move **678 MB** de imagens sem falha — o cache cumpre seu papel.

<img src="../evidencias/load/DomainShare-shareCard-load.png" width="700">

---

### 4.7 DomainTrending — Rankings em alta

Agrega comunidades e livros "em alta" (`GET /trending/communities`, `GET /trending/books`), materializados com apoio do Redis.

| Subdomínio | VUs | Requests | Throughput | p(95) | Falhas | Checks | Resultado |
|------------|-----|----------|-----------|-------|--------|--------|-----------|
| trending | 210 | 51.279 | 341,1/s | 31,3ms | 0% | 100% | Aprovado |

**Análise:** historicamente o domínio de **melhor escalabilidade** da suíte — p95 ≤ 38ms até 600 VUs no stress, graças à materialização/cache dos rankings.

<img src="../evidencias/load/DomainTrending-trending-load.png" width="700">

---

### 4.8 DomainDna — DNA literário

Calcula o "DNA literário" do usuário (perfil de gêneros/autores a partir do histórico de leitura).

| Subdomínio | VUs | Requests | Throughput | p(95) | Falhas | Checks | Resultado |
|------------|-----|----------|-----------|-------|--------|--------|-----------|
| dna | 80 | 12.381 | 92,9/s | 45,2ms | 0% | 100% | Aprovado |

**Análise:** apesar de percorrer todo o histórico de leitura, o cálculo é eficiente (p95 ~34ms em condições limpas), sem falhas.

<img src="../evidencias/load/DomainDna-dna-load.png" width="700">

---

## 5. Consolidação

### 5.1 Placar da bateria de load

- **24 testes de load executados**, um por subdomínio, cobrindo os 8 domínios.
- **Aprovados:** 24/24 (todos os thresholds ✓).
- **Falhas sistêmicas (5xx / erro de aplicação):** **0**.
- Única falha HTTP não-zero: `voting` 0,90% — **dentro** do threshold (< 1%), originada por contenção no fechamento de enquetes sob concorrência no cenário `manage` (não é erro do backend). Ver §6.1.

### 5.2 Destaques

| Categoria | Vencedor | Número |
|-----------|----------|--------|
| Maior throughput | roll-dice-load | 1.768 reqs/s (600 VUs), p95 31,4ms |
| Maior throughput sob payload pesado | recommendation-load | ~940 reqs/s (500 VUs, 6 estratégias) |
| Melhor throughput de leitura social | social-load | 672,2 reqs/s, p95 27,3ms |
| Menor latência | community-load | p95 15,9ms |
| Melhor escalabilidade | trending / shareCard (Redis) | p95 baixo e estável sob carga |
| Maior volume de dados | shareCard-load | 678 MB de imagens |
| Endpoint mais pesado (aceito) | recommendation | p95 772,98ms (6 estratégias por requisição) |

---

## 6. Conclusão

A bateria de load comprova um backend **estável e performático**:

- **Zero falhas sistêmicas** em 24 testes de carga, cobrindo todos os domínios funcionais.
- **Latência baixa** na esmagadora maioria dos endpoints (p95 < 100ms), com exceções justificadas pelo custo intrínseco da operação (recomendação: 6 estratégias por requisição).
- **Boa escalabilidade**: leituras intensivas (trending, share, social) se beneficiam de Redis/Neo4j e mantêm latência estável sob carga.
- **Estabilidade funcional**: checks de negócio em 100% (ou ≥ 99,8%) em todos os testes.

**Recomendações:**
1. Manter o padrão de cache (Redis) demonstrado por Trending e ShareCard como referência para novos endpoints de leitura intensiva.
2. Para medições absolutas mais fiéis, executar a suíte com banco limpo por domínio (evitar contaminação acumulada) — preferencialmente em ambiente hospedado isolado.

> **Evidências:** os 24 prints referenciados estão em `performance-tests/evidencias/load/`. Os relatórios técnicos completos (incluindo spike e stress) estão em `RELATORIO-GERAL.md` e nos `RELATORIO-<DOMAIN>.md` de cada domínio.