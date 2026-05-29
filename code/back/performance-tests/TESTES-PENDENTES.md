# Testes de Performance Pendentes

> **Referência:** 2026-05-28 (atualizado após bateria de 31 testes)
> Total: **12 testes pendentes** de 62 planejados (50 executados — 81%)
>
> ✅ **Já executados nesta atualização:** DomainUser (3), DomainShare (3), DomainTrending (3),
> DomainFeed inteiro (15 — sendo `review` reprovado), DomainCommunity manage+messageRest+voting (7).
>
> ⏳ **Restam 12:** DomainDna (3), DomainRecommendation recommendation+roll-dice (6),
> DomainCommunity `message`/WebSocket (3 + concurrency). As seções abaixo dos já executados
> permanecem como referência histórica; ver `RELATORIO-GERAL.md` para os resultados.

---

## DomainCommunity (10 pendentes)

### community/community-manage-stress.js
- **Tipo:** Stress
- **O que testa:** CREATE → UPDATE → DELETE de comunidades em loop de stress
- **Configuração:** Pool de 100 usuários pré-criados, 6 estágios até 200 VUs
- **Thresholds:** p(95) < 5000ms, taxa de falha < 10%
- **Dependência:** `bookId: 1` deve existir no banco
- **Como rodar:**
  ```bash
  cd performance-tests/DomainCommunity/community
  k6 run community-manage-stress.js
  ```

### message/message-load.js
- **Tipo:** Load
- **O que testa:** WebSocket + STOMP — 100 VUs enviando mensagens, 60 VUs lendo via HTTP REST, por 2 minutos
- **Métricas customizadas:** `stomp_connect_errors`, `stomp_messages_sent`, `stomp_messages_received`, `stomp_send_fail_rate`, `ws_connect_duration_ms`, `msg_delivery_latency_ms`, `msg_delivery_success_rate`
- **Thresholds:** p(95) HTTP < 1500ms, p(95) entrega < 2000ms, fail rate < 1%
- **Dependência:** `bookId: 1` existente; 80 usuários + 10 comunidades criados no setup; WebSocket habilitado no servidor
- **Como rodar:**
  ```bash
  cd performance-tests/DomainCommunity/message
  k6 run message-load.js
  ```

### message/message-spike.js
- **Tipo:** Spike
- **O que testa:** Pico de conexões WebSocket STOMP
- **Como rodar:**
  ```bash
  cd performance-tests/DomainCommunity/message
  k6 run message-spike.js
  ```

### message/message-stress.js
- **Tipo:** Stress
- **O que testa:** Stress de mensagens WebSocket com muitos VUs simultâneos
- **Como rodar:**
  ```bash
  cd performance-tests/DomainCommunity/message
  k6 run message-stress.js
  ```

### message/message-concurrency.js
- **Tipo:** Concorrência (especializado)
- **O que testa:** Comportamento de mensagens sob concorrência extrema
- **⚠️ Atenção:** Arquivo foi modificado (aparece no `git status` como `M`) — revisar as mudanças antes de executar
- **Como rodar:**
  ```bash
  cd performance-tests/DomainCommunity/message
  k6 run message-concurrency.js
  ```

### messageRest/messageRest-load.js
- **Tipo:** Load
- **O que testa:** `GET /communities/{id}/messages` (80 VUs) + `GET /communities/{id}/messages/sync` (40 VUs), 2m
- **Thresholds:** p(95) geral < 1000ms, listing < 800ms, sync < 500ms
- **Nota:** Upload de mídia (`POST /media` → Cloudinary) foi **intencionalmente excluído** para evitar custos da API
- **Como rodar:**
  ```bash
  cd performance-tests/DomainCommunity/messageRest
  k6 run messageRest-load.js
  ```

### messageRest/messageRest-spike.js
- **Tipo:** Spike
- **Como rodar:**
  ```bash
  cd performance-tests/DomainCommunity/messageRest
  k6 run messageRest-spike.js
  ```

### messageRest/messageRest-stress.js
- **Tipo:** Stress
- **Como rodar:**
  ```bash
  cd performance-tests/DomainCommunity/messageRest
  k6 run messageRest-stress.js
  ```

### voting/voting-load.js
- **Tipo:** Load
- **O que testa:** 84 VUs read + 21 VUs manage + 105 VUs vote, por 2m
- **Thresholds:** p(95) geral < 1000ms, read < 500ms, manage < 2000ms, vote < 800ms
- **Dependência:** `bookIds: [1, 2, 3, 4]` devem existir no banco; 50 usuários + 5 comunidades
- **Como rodar:**
  ```bash
  cd performance-tests/DomainCommunity/voting
  k6 run voting-load.js
  ```

### voting/voting-spike.js e voting/voting-stress.js
- **Tipo:** Spike e Stress
- **Como rodar:**
  ```bash
  cd performance-tests/DomainCommunity/voting
  k6 run voting-spike.js
  k6 run voting-stress.js
  ```

---

## DomainDna (3 pendentes)

### dna/dna-load.js, dna-spike.js, dna-stress.js
- **O que testa:** DNA literário do usuário (perfil de leitura/preferências)
- **Como rodar:**
  ```bash
  cd performance-tests/DomainDna/dna
  k6 run dna-load.js
  k6 run dna-spike.js
  k6 run dna-stress.js
  ```

---

## DomainFeed (15 pendentes)

### feed/feed-load.js, feed-spike.js, feed-stress.js
- **O que testa:** Feed principal do usuário (timeline de atividades)
- **Como rodar:**
  ```bash
  cd performance-tests/DomainFeed/feed
  k6 run feed-load.js
  k6 run feed-spike.js
  k6 run feed-stress.js
  ```

### post/post-load.js, post-spike.js, post-stress.js
- **O que testa:** Posts no feed (criação, leitura, listagem)
- **Como rodar:**
  ```bash
  cd performance-tests/DomainFeed/post
  k6 run post-load.js
  k6 run post-spike.js
  k6 run post-stress.js
  ```

### comment/comment-load.js, comment-spike.js, comment-stress.js
- **O que testa:** Comentários em posts
- **Como rodar:**
  ```bash
  cd performance-tests/DomainFeed/comment
  k6 run comment-load.js
  k6 run comment-spike.js
  k6 run comment-stress.js
  ```

### commentInteraction/commentInteraction-load.js, commentInteraction-spike.js, commentInteraction-stress.js
- **O que testa:** Interações com comentários (likes, reações)
- **Como rodar:**
  ```bash
  cd performance-tests/DomainFeed/commentInteraction
  k6 run commentInteraction-load.js
  k6 run commentInteraction-spike.js
  k6 run commentInteraction-stress.js
  ```

### review/review-load.js, review-spike.js, review-stress.js
- **O que testa:** Avaliações/resenhas de livros
- **Nota:** Há um arquivo `debug.js` nessa pasta — verificar se é necessário antes de rodar os testes principais
- **Como rodar:**
  ```bash
  cd performance-tests/DomainFeed/review
  k6 run review-load.js
  k6 run review-spike.js
  k6 run review-stress.js
  ```

---

## DomainRecommendation (6 pendentes)

### recommendation/recommendation-load.js, recommendation-spike.js, recommendation-stress.js
- **O que testa:** Recomendações de livros para o usuário
- **Como rodar:**
  ```bash
  cd performance-tests/DomainRecommendation/recommendation
  k6 run recommendation-load.js
  k6 run recommendation-spike.js
  k6 run recommendation-stress.js
  ```

### roll-dice/roll-dice-load.js, roll-dice-spike.js, roll-dice-stress.js
- **O que testa:** Funcionalidade "rolar dado" (recomendação aleatória de livro)
- **Como rodar:**
  ```bash
  cd performance-tests/DomainRecommendation/roll-dice
  k6 run roll-dice-load.js
  k6 run roll-dice-spike.js
  k6 run roll-dice-stress.js
  ```

---

## DomainShare (3 pendentes)

### shareCard/shareCard-load.js, shareCard-spike.js, shareCard-stress.js
- **O que testa:** Geração e compartilhamento de cards de leitura
- **Como rodar:**
  ```bash
  cd performance-tests/DomainShare/shareCard
  k6 run shareCard-load.js
  k6 run shareCard-spike.js
  k6 run shareCard-stress.js
  ```

---

## DomainTrending (3 pendentes)

### trending/trending-load.js, trending-spike.js, trending-stress.js
- **O que testa:** Livros em alta / trending (provavelmente agrega dados de múltiplos domínios)
- **Como rodar:**
  ```bash
  cd performance-tests/DomainTrending/trending
  k6 run trending-load.js
  k6 run trending-spike.js
  k6 run trending-stress.js
  ```

---

## DomainUser (3 pendentes)

### user/user-load.js, user-spike.js, user-stress.js
- **O que testa:** Perfil do usuário, follow/unfollow, busca de usuários
- **Como rodar:**
  ```bash
  cd performance-tests/DomainUser/user
  k6 run user-load.js
  k6 run user-spike.js
  k6 run user-stress.js
  ```

---

## Resumo por Domain

| Domain | Pendentes | Prioridade sugerida |
|--------|-----------|---------------------|
| DomainCommunity | 10 | 🔴 Alta — tem bug conhecido (join-requests) + WebSocket não testado |
| DomainUser | 3 | 🔴 Alta — base de todo o sistema |
| DomainFeed | 15 | 🟠 Média-alta — funcionalidade central do produto |
| DomainDna | 3 | 🟡 Média |
| DomainRecommendation | 6 | 🟡 Média |
| DomainTrending | 3 | 🟢 Baixa — provavelmente só leitura |
| DomainShare | 3 | 🟢 Baixa |

## Ordem de Execução Sugerida

1. `DomainCommunity/community/community-manage-stress.js` (curto, sem dependências extras)
2. `DomainUser/user/user-load.js` → `user-spike.js` → `user-stress.js`
3. `DomainCommunity/messageRest/` (3 testes — mais simples que WebSocket)
4. `DomainCommunity/voting/` (3 testes)
5. `DomainDna/dna/` (3 testes)
6. `DomainFeed/feed/` → `post/` → `comment/` → `commentInteraction/` → `review/` (15 testes)
7. `DomainRecommendation/recommendation/` → `roll-dice/` (6 testes)
8. `DomainTrending/trending/` (3 testes)
9. `DomainShare/shareCard/` (3 testes)
10. `DomainCommunity/message/` (4 testes — por último, requer WebSocket e setup mais complexo)

> **Nota:** Verificar o arquivo `message-concurrency.js` (modificado no git) antes de executar os testes de mensagem WebSocket.
