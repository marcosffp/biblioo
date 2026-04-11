# Integração de Notificações — Biblioo

Este documento descreve como o **front-end (Next.js)** e o **mobile (Flutter)** devem integrar com o sistema de notificações do back-end.

---

## Visão geral

O back publica notificações via dois canais simultaneamente:

| Canal | Tecnologia | Para quem |
|-------|-----------|-----------|
| Tempo real | SSE (Server-Sent Events) | Web (Next.js) |
| Push notification | FCM (Firebase Cloud Messaging) | Mobile (Flutter) |

Os eventos atualmente implementados são:

| Tipo (`type`) | Quando dispara |
|--------------|---------------|
| `USER_FOLLOW_REQUESTED` | Alguém solicitou seguir uma conta privada |
| `USER_FOLLOWED` | Alguém seguiu (conta pública) ou o pedido foi aceito |
| `COMMENT_REPLIED` | Alguém respondeu um comentário |
| `REVIEW_LIKED` | Alguém curtiu uma resenha |

---

## Payload da notificação

Todos os eventos compartilham o mesmo formato JSON:

```json
{
  "id": "183cf915-30b2-49b3-9bcb-318068841ea8",
  "type": "USER_FOLLOW_REQUESTED",
  "actorId": 1,
  "actorUsername": "RafaelAura67",
  "actorAvatarUrl": "https://res.cloudinary.com/...",
  "entityId": null,
  "read": false,
  "createdAt": "2026-04-09T18:27:42.820284"
}
```

- `entityId` — ID da review ou comentário relacionado. `null` para eventos de follow.
- `actorAvatarUrl` — pode ser string vazia `""` se o usuário não tiver avatar.

---

## Endpoints REST disponíveis

Todos os endpoints abaixo exigem autenticação via header `Authorization: Bearer <token>`.

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/notifications/stream` | Abre o stream SSE (web) |
| `GET` | `/notifications?page=0&size=20` | Lista o histórico de notificações |
| `GET` | `/notifications/unread-count` | Retorna `{ "count": 3 }` para o badge |
| `PUT` | `/notifications/{id}/read` | Marca uma notificação como lida |
| `PUT` | `/notifications/read-all` | Marca todas como lidas |
| `POST` | `/notifications/device-token` | Registra token FCM do device (mobile) |
| `DELETE` | `/notifications/device-token` | Remove token FCM (logout) |

---

---

## Front-end — Next.js

### Como funciona

O front abre uma conexão SSE persistente com o back quando o usuário está autenticado. O back empurra as notificações em tempo real assim que chegam. A conexão é HTTP normal — sem WebSocket, sem biblioteca extra.

### 1. Hook `useNotifications`

Crie o arquivo `src/hooks/useNotifications.ts`:

```typescript
import { useEffect, useRef, useState } from "react";

export interface Notification {
  id: string;
  type:
    | "USER_FOLLOW_REQUESTED"
    | "USER_FOLLOWED"
    | "COMMENT_REPLIED"
    | "REVIEW_LIKED";
  actorId: number;
  actorUsername: string;
  actorAvatarUrl: string | null;
  entityId: number | null;
  read: boolean;
  createdAt: string;
}

export function useNotifications(token: string | null) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const sourceRef = useRef<EventSource | null>(null);

  // Busca o histórico ao montar
  useEffect(() => {
    if (!token) return;

    fetch("/api/notifications?page=0&size=20", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data: Notification[]) => {
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.read).length);
      });
  }, [token]);

  // Abre o stream SSE
  useEffect(() => {
    if (!token) return;

    // EventSource não suporta headers nativamente.
    // Use a URL com o token como query param (o back aceita via query também),
    // ou use a lib `@microsoft/fetch-event-source` para enviar o header.
    // Exemplo com query param:
    const source = new EventSource(
      `${process.env.NEXT_PUBLIC_API_URL}/notifications/stream?token=${token}`
    );

    source.addEventListener("notification", (e: MessageEvent) => {
      const notification: Notification = JSON.parse(e.data);
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    source.onerror = () => {
      // O browser reconecta automaticamente.
      // Se quiser logar: console.warn("SSE reconectando...");
    };

    sourceRef.current = source;
    return () => source.close();
  }, [token]);

  const markAsRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    await fetch("/api/notifications/read-all", {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return { notifications, unreadCount, markAsRead, markAllAsRead };
}
```

> **Atenção:** O `EventSource` nativo do browser não suporta envio de headers.
> Duas alternativas:
> - Usar a lib [`@microsoft/fetch-event-source`](https://github.com/Azure/fetch-event-source) que suporta headers HTTP normais.
> - Configurar o back para aceitar o token via query param `?token=...` (requer ajuste no `SecurityConfig`).
>
> A opção mais simples para desenvolvimento é usar `fetch-event-source`.

### 2. Instalação com `fetch-event-source`

```bash
npm install @microsoft/fetch-event-source
```

Substitua o bloco do `EventSource` no hook por:

```typescript
import { fetchEventSource } from "@microsoft/fetch-event-source";

// Dentro do useEffect:
const controller = new AbortController();

fetchEventSource(`${process.env.NEXT_PUBLIC_API_URL}/notifications/stream`, {
  headers: { Authorization: `Bearer ${token}` },
  signal: controller.signal,
  onmessage(event) {
    if (event.event === "notification") {
      const notification: Notification = JSON.parse(event.data);
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    }
  },
});

return () => controller.abort();
```

### 3. Componente de badge

```tsx
// src/components/NotificationBell.tsx
import { useNotifications } from "@/hooks/useNotifications";
import { useSession } from "next-auth/react"; // ou seu hook de auth

export function NotificationBell() {
  const { data: session } = useSession();
  const { unreadCount, notifications, markAsRead } = useNotifications(
    session?.accessToken ?? null
  );

  return (
    <div className="relative">
      <button>🔔</button>
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
      {/* Dropdown com a lista de notificações */}
    </div>
  );
}
```

### 4. Textos das notificações

```typescript
export function getNotificationText(notification: Notification): string {
  switch (notification.type) {
    case "USER_FOLLOW_REQUESTED":
      return `${notification.actorUsername} quer te seguir`;
    case "USER_FOLLOWED":
      return `${notification.actorUsername} começou a te seguir`;
    case "COMMENT_REPLIED":
      return `${notification.actorUsername} respondeu seu comentário`;
    case "REVIEW_LIKED":
      return `${notification.actorUsername} curtiu sua resenha`;
  }
}
```

---

---

## Mobile — Flutter

### Como funciona

O mobile recebe notificações via **Firebase Cloud Messaging (FCM)**. O app precisa:
1. Inicializar o Firebase
2. Pegar o token FCM do device e registrar no back após o login
3. Escutar mensagens quando o app está aberto
4. Remover o token do back no logout

Quando o app está **fechado ou em background**, o FCM entrega a notificação nativamente no SO (Android/iOS) — sem nenhum código adicional.

### 1. Dependências (`pubspec.yaml`)

```yaml
dependencies:
  firebase_core: ^3.0.0
  firebase_messaging: ^15.0.0
```

```bash
flutter pub get
```

### 2. Configuração do Firebase

Siga o setup do **FlutterFire** no Firebase Console:
1. Acesse [console.firebase.google.com](https://console.firebase.google.com) e abra o projeto Biblioo
2. Adicione o app Flutter (Android + iOS separados)
3. Baixe o `google-services.json` → coloque em `android/app/`
4. Baixe o `GoogleService-Info.plist` → coloque em `ios/Runner/`
5. Siga as instruções de configuração nativa do FlutterFire

### 3. Inicialização no `main.dart`

```dart
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

// Handler para mensagens em background (precisa ser top-level)
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  // mensagem recebida com app fechado — não precisa fazer nada,
  // o FCM já exibe a notificação nativa automaticamente.
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
  runApp(const BibliooApp());
}
```

### 4. Registro do token após login

Após o usuário fazer login e você ter o JWT em mãos:

```dart
import 'package:firebase_messaging/firebase_messaging.dart';

Future<void> registerDeviceToken(String jwtToken) async {
  // Pede permissão (obrigatório no iOS)
  final settings = await FirebaseMessaging.instance.requestPermission();
  if (settings.authorizationStatus != AuthorizationStatus.authorized) return;

  final fcmToken = await FirebaseMessaging.instance.getToken();
  if (fcmToken == null) return;

  await http.post(
    Uri.parse('$baseUrl/notifications/device-token'),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $jwtToken',
    },
    body: jsonEncode({'token': fcmToken}),
  );

  // Atualiza o token se ele for renovado pelo Firebase
  FirebaseMessaging.instance.onTokenRefresh.listen((newToken) async {
    await http.post(
      Uri.parse('$baseUrl/notifications/device-token'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $jwtToken',
      },
      body: jsonEncode({'token': newToken}),
    );
  });
}
```

> Chame `registerDeviceToken(jwt)` logo após salvar o token JWT no state do app.

### 5. Escutar mensagens com o app aberto

```dart
class _HomeState extends State<HomePage> {
  @override
  void initState() {
    super.initState();
    _listenToNotifications();
  }

  void _listenToNotifications() {
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      final type = message.data['type'];
      final actor = message.data['actorUsername'];

      // Exibe um SnackBar ou toast
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(_buildText(type, actor))),
      );

      // Opcional: atualiza o badge de notificações no estado global
    });
  }

  String _buildText(String? type, String? actor) {
    switch (type) {
      case 'USER_FOLLOW_REQUESTED':
        return '$actor quer te seguir';
      case 'USER_FOLLOWED':
        return '$actor começou a te seguir';
      case 'COMMENT_REPLIED':
        return '$actor respondeu seu comentário';
      case 'REVIEW_LIKED':
        return '$actor curtiu sua resenha';
      default:
        return 'Nova notificação';
    }
  }
}
```

### 6. Dados disponíveis na mensagem FCM

Além do título da notificação (exibido automaticamente pelo SO), o campo `data` contém:

```dart
message.data['notificationId'] // String — ID para marcar como lida
message.data['type']           // String — tipo do evento
message.data['actorId']        // String — ID do usuário que gerou
message.data['actorUsername']  // String
message.data['actorAvatarUrl'] // String (pode ser "")
message.data['entityId']       // String (pode ser "" para eventos de follow)
```

### 7. Remoção do token no logout

```dart
Future<void> logout(String jwtToken) async {
  final fcmToken = await FirebaseMessaging.instance.getToken();

  if (fcmToken != null) {
    await http.delete(
      Uri.parse('$baseUrl/notifications/device-token'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $jwtToken',
      },
      body: jsonEncode({'token': fcmToken}),
    );
  }

  // Limpa o JWT e redireciona para o login
}
```

### 8. Buscar histórico de notificações

Para exibir a tela de notificações com o histórico:

```dart
Future<List<Map<String, dynamic>>> fetchNotifications(String jwtToken, {int page = 0}) async {
  final response = await http.get(
    Uri.parse('$baseUrl/notifications?page=$page&size=20'),
    headers: {'Authorization': 'Bearer $jwtToken'},
  );
  final List<dynamic> list = jsonDecode(response.body);
  return list.cast<Map<String, dynamic>>();
}

Future<int> fetchUnreadCount(String jwtToken) async {
  final response = await http.get(
    Uri.parse('$baseUrl/notifications/unread-count'),
    headers: {'Authorization': 'Bearer $jwtToken'},
  );
  return jsonDecode(response.body)['count'] as int;
}

Future<void> markAsRead(String jwtToken, String notificationId) async {
  await http.put(
    Uri.parse('$baseUrl/notifications/$notificationId/read'),
    headers: {'Authorization': 'Bearer $jwtToken'},
  );
}
```

---

## Dúvidas

Qualquer dúvida sobre a API, consulte a documentação Swagger disponível em:

```
http://localhost:8080/swagger-ui/index.html
```

Ou fale com o time de back-end (Rafael).
