# Typing Indicator — Biblioo Community Chat

Este documento descreve como o **front-end (Next.js)** e o **mobile (Flutter)** devem implementar o indicador de digitação no chat das comunidades.

---

## Visão geral

O indicador de digitação funciona em **três etapas no cliente**:

1. **Enviar** — quando o usuário digita, envia um sinal vazio ao servidor (o back-end aplica throttle e busca o avatar)
2. **Receber** — o servidor repassa o sinal para todos os membros conectados com o `userId` e `avatarUrl` de quem está digitando
3. **Expirar** — o cliente mantém um mapa de `{ userId → timestamp }` e verifica a cada 500 ms: quem ficou mais de 2 s sem novo sinal some automaticamente

```
Usuário A digita
     │
     ▼  (body vazio)
/app/community/{id}/typing
     │
     ▼
Servidor: valida membership
          throttle server-side (1s por userId+community)
          busca avatarUrl do banco
     │
     ├──► /topic/community.{id}.typing  → Usuário B (mesma instância)
     │
     └──► RabbitMQ FanoutExchange ──► outras instâncias
               │
               ▼
          /topic/community.{id}.typing  → Usuário C (outra instância)
```

---

## Pré-requisito: conexão WebSocket (STOMP)

A conexão STOMP já é necessária para o chat. O endpoint é `/ws/community` (com fallback SockJS em `/ws`).

No CONNECT, enviar o JWT no header `Authorization`:

```js
const client = new Client({
  brokerURL: 'ws://localhost:8080/ws/community',
  connectHeaders: {
    Authorization: `Bearer ${accessToken}`,
  },
});
```

---

## 1. Subscrever ao tópico de typing

Após conectar, subscrever ao tópico da comunidade **antes** de renderizar o campo de mensagem:

```
Destino: /topic/community.{communityId}.typing
```

### Next.js (React)

```ts
const typingMap = useRef<Map<number, number>>(new Map()); // userId → timestamp

const subscription = client.subscribe(
  `/topic/community.${communityId}.typing`,
  (frame) => {
    const { userId, avatarUrl }: { userId: number; avatarUrl: string | null } =
      JSON.parse(frame.body);

    // Ignorar o próprio sinal
    if (userId === currentUserId) return;

    typingMap.current.set(userId, Date.now());
    setTypingAvatars(getActiveTypers(typingMap.current));
  }
);

// Cancelar ao desmontar o componente
return () => subscription.unsubscribe();
```

### Flutter

```dart
final subscription = client.subscribe(
  destination: '/topic/community/$communityId/typing',
  callback: (frame) {
    final data = jsonDecode(frame.body!) as Map<String, dynamic>;
    final userId = data['userId'] as int;
    final avatarUrl = data['avatarUrl'] as String?;

    // Ignorar o próprio sinal
    if (userId == currentUserId) return;

    setState(() {
      typingMap[userId] = TypingEntry(avatarUrl: avatarUrl, timestamp: DateTime.now());
    });
  },
);

// Cancelar ao desmontar o widget
@override
void dispose() {
  subscription.unsubscribe();
  _typingTimer?.cancel();
  super.dispose();
}
```

---

## 2. Payload recebido

O `avatarUrl` é resolvido pelo servidor — o cliente não precisa enviá-lo nem mantê-lo em cache para o próprio usuário.

```json
{
  "userId": 42,
  "avatarUrl": "https://res.cloudinary.com/biblioo/image/upload/v1/avatars/user_42.jpg"
}
```

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `userId` | `number` | ID do usuário que está digitando |
| `avatarUrl` | `string \| null` | URL do avatar buscada pelo servidor; `null` se o usuário não tiver avatar |

> Quando `avatarUrl` for `null`, exibir um avatar placeholder local.

---

## 3. Enviar sinal de typing

Enviar para o destino STOMP abaixo. O **body deve ser vazio** — o servidor identifica o usuário pelo JWT e busca o `avatarUrl` internamente.

```text
Destino: /app/community/{communityId}/typing
Body: {} (vazio)
```

O servidor aplica throttle de 1 sinal por segundo por usuário por comunidade. O cliente pode aplicar o throttle também para evitar envios desnecessários à rede, mas não é obrigatório.

### Next.js (React) — hook completo

```ts
const lastTypingSentRef = useRef(0);
const CLIENT_THROTTLE_MS = 800; // margem abaixo do throttle server (1000ms)

function handleKeyDown() {
  const now = Date.now();
  if (now - lastTypingSentRef.current < CLIENT_THROTTLE_MS) return;

  lastTypingSentRef.current = now;

  client.publish({
    destination: `/app/community/${communityId}/typing`,
    body: '{}',
  });
}

// No JSX:
<input onKeyDown={handleKeyDown} ... />
```

### Flutter — throttle

```dart
DateTime? _lastTypingSent;
static const _clientThrottle = Duration(milliseconds: 800);

void _onTextChanged(String text) {
  final now = DateTime.now();
  if (_lastTypingSent != null &&
      now.difference(_lastTypingSent!) < _clientThrottle) {
    return;
  }
  _lastTypingSent = now;

  client.send(
    destination: '/app/community/$communityId/typing',
    body: '{}',
  );
}
```

---

## 4. Expirar typing automaticamente (2 segundos)

O cliente verifica a cada **500 ms** quem ainda está digitando. Se o timestamp de um usuário for mais antigo que **2 segundos**, ele é removido.

```text
Envio a cada ~800ms (cliente) ──┐
Throttle server-side: 1s        │
                                ▼
Expiração em 2s ─── folga de 1s garante renovação contínua enquanto digita
                        └─ quando para de digitar: sem novo sinal → expira em 2s
```

### Next.js (React) — timer de limpeza

```ts
const TYPING_EXPIRY_MS = 2_000;
const TYPING_POLL_MS   = 500;

useEffect(() => {
  const interval = setInterval(() => {
    const now = Date.now();
    let changed = false;

    typingMap.current.forEach((ts, userId) => {
      if (now - ts > TYPING_EXPIRY_MS) {
        typingMap.current.delete(userId);
        changed = true;
      }
    });

    if (changed) setTypingAvatars(getActiveTypers(typingMap.current));
  }, TYPING_POLL_MS);

  return () => clearInterval(interval);
}, []);

function getActiveTypers(map: Map<number, number>) {
  // avatarUrl já vem no evento e está em typingAvatars state
  return [...map.keys()];
}
```

### Flutter — timer de limpeza

```dart
Timer? _typingTimer;

void _startTypingWatcher() {
  _typingTimer = Timer.periodic(const Duration(milliseconds: 500), (_) {
    final now = DateTime.now();
    final expired = typingMap.entries
        .where((e) => now.difference(e.value.timestamp).inSeconds >= 2)
        .map((e) => e.key)
        .toList();

    if (expired.isNotEmpty) {
      setState(() => expired.forEach(typingMap.remove));
    }
  });
}
```

---

## 5. Exibir o indicador

Regra de exibição: mostrar os avatares de quem está digitando. Sugestão de UX:

| Quantidade digitando | Texto sugerido |
|---|---|
| 1 pessoa | `Ana está digitando...` |
| 2 pessoas | `Ana e Bruno estão digitando...` |
| 3+ pessoas | `Várias pessoas estão digitando...` |

Para mostrar o nome junto ao avatar, usar o cache local de perfis de usuário já carregado ao listar membros da comunidade (`GET /communities/{id}/members`).

---

## 6. Ciclo de vida completo

```
Conectar STOMP
      │
      ▼
Subscrever /topic/community.{id}.typing
      │
      ▼  (usuário começa a digitar)
onKeyDown → throttle cliente ~800ms → publish /app/community/{id}/typing  {}
      │
      ▼  (servidor: throttle 1s, valida membership, busca avatarUrl, broadcast)
Receber { userId, avatarUrl }
      │
      ├── userId == próprio? → ignorar
      │
      └── userId diferente? → typingMap.set(userId, Date.now())
                                    │
                          Intervalo 500ms
                                    │
                          now - ts > 2000ms?
                                    │
                           sim → deletar do map → some da tela
                           não → manter exibindo
```

---

## 7. Responsabilidades por camada

| Responsabilidade | Backend | Frontend |
| --- | :---: | :---: |
| Validar que o usuário é membro | ✅ | — |
| Throttle de 1 sinal/s por usuário/comunidade | ✅ | opcional (recomendado ~800ms para reduzir tráfego de rede) |
| Buscar e fornecer `avatarUrl` | ✅ | — |
| Broadcast cross-instance (via RabbitMQ) | ✅ | — |
| Ignorar o próprio sinal | — | ✅ (comparar `userId` com o ID do usuário logado) |
| Expirar entradas após 2 s sem sinal | — | ✅ (timer de 500ms) |
| Cancelar subscription e timer ao sair da tela | — | ✅ (cleanup de lifecycle) |
| Exibir avatar placeholder quando `avatarUrl` é `null` | — | ✅ |
