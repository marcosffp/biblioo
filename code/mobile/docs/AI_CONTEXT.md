# Biblioo — Contexto de Arquitetura para IA

Cole este arquivo como contexto antes de pedir qualquer geração de código Flutter para o projeto Biblioo.

---

## Sobre o Projeto

Biblioo é um app mobile de leitura desenvolvido em Flutter com Dart. É um frontend offline-first para uma API REST, com suporte a WebSockets. O app deve funcionar sem conexão e sincronizar com o servidor quando online.

**Stack:**
- Flutter + Dart
- Gerenciamento de estado: Bloc / Cubit
- Banco local: Drift (SQLite)
- HTTP: Dio
- WebSocket: web_socket_channel
- Injeção de dependência: get_it + injectable
- Roteamento: go_router
- Modelos imutáveis: freezed

---

## Arquitetura

O projeto segue **Feature-first com datasources + Screen layer** com conceitos pontuais de DDD (Value Objects e Aggregate Roots).

**Separação principal:**
- `features/` — domínio de negócio: dados, lógica, estado. Nunca sabe de telas.
- `screens/` — telas do app: composição de Blocs de múltiplas features.
- `shared/` — widgets e utils reutilizáveis. Não importa features nem screens.

### Estrutura completa

```
lib/
├── main.dart
├── bootstrap.dart
├── core/
│   ├── database/
│   ├── network/
│   ├── sync/
│   ├── connectivity/
│   ├── router/
│   ├── theme/
│   └── di/
├── features/
│   ├── auth/
│   ├── shelf/
│   ├── book/
│   ├── community/
│   ├── dna/
│   └── recommendation/
├── screens/
│   ├── feed/
│   ├── recommendation/
│   ├── shelf/
│   ├── community/
│   └── profile/
└── shared/
    ├── widgets/
    ├── utils/
    └── constants/
```

### Estrutura de uma feature

```
features/
└── {feature}/
    ├── data/
    │   ├── {feature}_local_datasource.dart
    │   ├── {feature}_remote_datasource.dart
    │   ├── {feature}_repository.dart
    │   └── models/
    │       └── {feature}_model.dart
    ├── domain/
    │   ├── {feature}.dart              # entity / aggregate root
    │   └── value_objects/
    │       └── {value_object}.dart
    └── bloc/
        ├── {feature}_bloc.dart
        ├── {feature}_event.dart
        └── {feature}_state.dart
```

Features **não têm** pasta `pages/` ou `presentation/` — as telas vivem em `screens/`.

### Estrutura de uma screen

```
screens/
└── {screen}/
    ├── {screen}_screen.dart
    └── widgets/
        └── {widget_name}.dart
```

---

## Regras que a IA DEVE seguir ao gerar código

### 1. Regra de importação — a mais importante

```dart
// ✅ Screen importando múltiplas features — CORRETO
// screens/feed/feed_screen.dart
import 'package:biblioo/features/community/bloc/community_bloc.dart';
import 'package:biblioo/features/book/bloc/book_bloc.dart';
import 'package:biblioo/features/shelf/bloc/shelf_bloc.dart';

// ❌ Feature importando outra feature — NUNCA
// features/shelf/data/shelf_repository.dart
import 'package:biblioo/features/book/...'; // proibido

// ❌ Feature importando screen — NUNCA
// features/shelf/bloc/shelf_bloc.dart
import 'package:biblioo/screens/...'; // proibido
```

### 2. Screen — monta o contexto de Blocs

```dart
// ✅ CORRETO
class FeedScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(create: (_) => GetIt.I<CommunityBloc>()),
        BlocProvider(create: (_) => GetIt.I<BookBloc>()),
        BlocProvider(create: (_) => GetIt.I<ShelfBloc>()),
      ],
      child: const FeedView(),
    );
  }
}

// ❌ ERRADO — screen com lógica de negócio
class FeedScreen extends StatelessWidget {
  List<Post> _filterPosts(List<Post> posts) { ... } // isso é domain
}
```

### 3. Domain — zero dependência externa

```dart
// ✅ CORRETO
class Shelf {
  final List<ShelfItem> items;
  bool containsBook(int bookId) =>
    items.any((i) => i.bookId == bookId);
}

class Rating {
  final int value;
  const Rating(this.value) : assert(value >= 1 && value <= 5);
}

// ❌ ERRADO — domain importando lib externa
import 'package:dio/dio.dart'; // proibido no domain
import 'package:drift/drift.dart'; // proibido no domain
```

### 4. Model — só serialização

```dart
// ✅ CORRETO
class ShelfModel {
  factory ShelfModel.fromJson(Map<String, dynamic> json) => ...
  factory ShelfModel.fromLocal(ShelfLocalData row) => ...
  Shelf toEntity() => ...
}

// ❌ ERRADO — regra de negócio no model
class ShelfModel {
  bool isComplete() => ...; // isso é domain
}
```

### 5. LocalDatasource — só Drift

```dart
// ✅ CORRETO
class ShelfLocalDatasource {
  final AppDatabase _db;
  Future<List<ShelfModel>> getShelves(int userId) async { ... }
}

// ❌ ERRADO
class ShelfLocalDatasource {
  final Dio _dio; // proibido
}
```

### 6. RemoteDatasource — só Dio

```dart
// ✅ CORRETO
class ShelfRemoteDatasource {
  final Dio _dio;
  Future<List<ShelfModel>> getShelves(int userId) async { ... }
}

// ❌ ERRADO
class ShelfRemoteDatasource {
  final AppDatabase _db; // proibido
}
```

### 7. Repository — offline-first sempre

```dart
// ✅ CORRETO — local primeiro, remote em background
Future<List<Shelf>> getShelves(int userId) async {
  final local = await _local.getShelves(userId);

  if (!await _connectivity.isOnline) {
    return local.map((m) => m.toEntity()).toList();
  }

  try {
    final remote = await _remote.getShelves(userId);
    await _local.saveShelves(remote);
    return remote.map((m) => m.toEntity()).toList();
  } catch (_) {
    return local.map((m) => m.toEntity()).toList();
  }
}

// ❌ ERRADO — ignorar o local
Future<List<Shelf>> getShelves(int userId) async {
  return (await _remote.getShelves(userId))
    .map((m) => m.toEntity())
    .toList();
}
```

### 8. Bloc — só estado, sem regras de negócio

```dart
// ✅ CORRETO
abstract class ShelfState extends Equatable {}
class ShelfLoading extends ShelfState { ... }
class ShelfLoaded  extends ShelfState {
  final List<Shelf> shelves;
  final bool isSyncing;
}
class ShelfError   extends ShelfState { final String message; }

class ShelfBloc extends Bloc<ShelfEvent, ShelfState> {
  final ShelfRepository _repository; // só repository, nunca datasource

  Future<void> _onLoad(LoadShelves event, Emitter emit) async {
    emit(ShelfLoading());
    try {
      final shelves = await _repository.getShelves(event.userId);
      emit(ShelfLoaded(shelves: shelves));
    } catch (e) {
      emit(ShelfError(message: e.toString()));
    }
  }
}

// ❌ ERRADO — regra de negócio no Bloc
Future<void> _onAddBook(AddBook event, Emitter emit) async {
  if (state.shelf.items.length > 100) { // isso é domain
    emit(ShelfError(message: 'Limite atingido'));
  }
}
```

### 9. Widgets — burros por padrão

```dart
// ✅ CORRETO — recebe dados, emite callbacks
class ShelfItemCard extends StatelessWidget {
  final Shelf shelf;
  final VoidCallback onTap;
  const ShelfItemCard({required this.shelf, required this.onTap});
}

// ❌ ERRADO — widget com acesso direto ao repository
class ShelfItemCard extends StatelessWidget {
  void _handleTap() {
    GetIt.I<ShelfRepository>().deleteShelf(...); // nunca
  }
}
```

---

## Proibições absolutas

- `features/` não importa outras features
- `features/` não importa `screens/`
- `shared/` não importa `features/` nem `screens/`
- Domain não importa: `dio`, `drift`, `flutter`, `get_it`
- Bloc não chama datasource diretamente (sempre via repository)
- Widget não acessa repository ou datasource diretamente
- LocalDatasource não importa `dio`
- RemoteDatasource não importa `drift`
- Repository não contém lógica de UI ou navegação

---

## Mapa de Telas × Features

| Screen | Features consumidas |
|---|---|
| `feed_screen` | `community`, `book`, `shelf` |
| `recommendation_screen` | `recommendation`, `book` |
| `dice_screen` | `recommendation` |
| `shelf_list_screen` | `shelf` |
| `shelf_detail_screen` | `shelf`, `book` |
| `reading_progress_screen` | `shelf` |
| `community_list_screen` | `community` |
| `community_detail_screen` | `community`, `book` |
| `chat_screen` | `community` |
| `profile_screen` | `auth`, `shelf`, `dna` |
| `edit_profile_screen` | `auth` |
| `dna_screen` | `dna` |

---

## Features existentes

- `auth` — login, registro, refresh token
- `shelf` — estantes e itens de leitura
- `book` — catálogo de livros
- `community` — comunidades por livro, posts, reações, chat
- `dna` — perfil de leitor (DNA Literário)
- `recommendation` — trilhas de recomendação

---

## Convenção de nomenclatura

| Tipo | Exemplo |
|---|---|
| Entity | `shelf.dart` |
| Value Object | `reading_progress.dart` |
| Model | `shelf_model.dart` |
| Local datasource | `shelf_local_datasource.dart` |
| Remote datasource | `shelf_remote_datasource.dart` |
| Repository | `shelf_repository.dart` |
| Bloc | `shelf_bloc.dart` |
| Event | `shelf_event.dart` |
| State | `shelf_state.dart` |
| Screen | `shelf_list_screen.dart` |
| Widget de screen | `shelf_item_card.dart` |
| Widget compartilhado | `shared/widgets/book_cover.dart` |
