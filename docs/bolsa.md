
<a name="bolsa"></a>
# Evidências de Qualidade

## Testes de Performance — Bateria de Stress

A bateria completa de 72 testes (load · spike · stress) valida empiricamente que a arquitetura atende os requisitos não-funcionais sob carga extrema. O relatório técnico completo está na seção [7. Avaliação da Arquitetura](7.avaliacao.md#avaliacao). As evidências abaixo representam os domínios centrais sob stress máximo — cada imagem é a saída-resumo real do k6 com o bloco `THRESHOLDS` aprovado, gerada pela ferramenta `freeze`.

**Busca de livros — `books-stress` (400 VUs · p95 100,89 ms · PASSOU)**

<img src="../code/back/performance-tests/evidencias/stress/DomainBook-book-stress.png" width="700">

**Feed social — `feed-stress` (600 VUs · p95 303,43 ms · PASSOU)**

<img src="../code/back/performance-tests/evidencias/stress/DomainFeed-feed-stress.png" width="700">

**Motor de recomendação (6 trilhas em paralelo) — `recommendation-stress` (400 VUs · p95 1 210 ms · PASSOU)**

<img src="../code/back/performance-tests/evidencias/stress/DomainRecommendation-recommendation-stress.png" width="700">

**Perfil do leitor — `user-stress` (600 VUs · p95 349,76 ms · PASSOU)**

<img src="../code/back/performance-tests/evidencias/stress/DomainUser-user-stress.png" width="700">

---

## Evidências de Mensageria — RabbitMQ / Outbox Pattern / WebSocket

O RabbitMQ (CloudAMQP) é o backbone assíncrono de toda a comunicação inter-módulo do Biblioo. Nenhum módulo chama outro diretamente — toda interação entre domínios ocorre via eventos publicados no broker, consumidos no próprio ritmo de cada módulo. O **Outbox Pattern** garante que toda publicação aconteça dentro de `@Transactional`, eliminando a possibilidade de evento perdido por falha entre a gravação no banco e a publicação na fila.

**Fluxos de mensageria ativos no sistema:**

| Fluxo | Evento | Producer | Consumer | Efeito |
| --- | --- | --- | --- | --- |
| Feed social | `POST_CREATED`, `REVIEW_CREATED`, `FOLLOW_ACCEPTED` | `feed`, `user` | `FeedConsumer` | Atualiza timeline dos seguidores (fanout-on-write) |
| Recomendações | `BOOK_FINISHED`, `BOOK_STARTED` | `shelf` | `RecommendationConsumer` | Recalcula as 6 trilhas do usuário |
| DNA Literário | `BOOK_FINISHED`, `BOOK_STARTED` | `shelf` | `DnaConsumer` | Reconstrói perfil analítico literário |
| Notificações | `LIKE_CREATED`, `COMMENT_CREATED`, `FOLLOW_REQUESTED`, `INVITE_SENT` | `feed`, `user`, `community` | `NotificationConsumer` | Envia SSE (web) e Firebase FCM (mobile) |
| Trending | `BOOK_FINISHED`, `COMMUNITY_JOINED`, `SHELF_ITEM_ADDED` | `shelf`, `community` | `TrendingConsumer` | Atualiza pontuação de tendência dos livros |
| Share | `SHARE_CARD_GENERATED` | `share` | — | Persiste cartão de compartilhamento e invalida cache Redis |
| Chat multi-instância | `CHAT_MESSAGE_SENT` | `community` (via STOMP) | `CommunityBroadcastConsumer` | `FanoutExchange` reentrega para todas as réplicas Cloud Run ativas |

Todos os consumers verificam o `event_id` antes de processar — eventos reentregues por falha de rede não produzem efeitos duplicados (idempotência garantida).

**Evidência — `message-stress` (WebSocket/STOMP · 250 VUs · 100% de entrega · p95 32 ms · PASSOU)**

<img src="../code/back/performance-tests/evidencias/stress/DomainCommunity-message-stress.png" width="700">

**Evidência — `message-concurrency-stress` (múltiplas salas simultâneas via FanoutExchange · PASSOU)**

<img src="../code/back/performance-tests/evidencias/stress/DomainCommunity-message-concurrency-stress.png" width="700">

**Evidência — `messageRest-stress` (histórico de chat via REST · 600 VUs · p95 525,69 ms · PASSOU)**

<img src="../code/back/performance-tests/evidencias/stress/DomainCommunity-messageRest-stress.png" width="700">
