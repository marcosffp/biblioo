# Biblioo — Guia de Arquitetura Mobile

> Guia para devs do time. Leia antes de codar qualquer feature.

---

## Visão Geral

O app segue **Feature-first com datasources + Screen layer**, com conceitos pontuais de DDD (Value Objects e Aggregate Roots). Não é Clean Architecture completa — sem usecases formais, sem interfaces de repository.

A separação principal: **features** são domínios de negócio (dados, lógica, estado), **screens** são telas do app (composição de features).

```
lib/
├── main.dart
├── bootstrap.dart
├── core/
│   ├── database/         # Drift · SQLite
│   ├── network/          # Dio · WebSocket
│   ├── sync/             # SyncManager · SyncQueue
│   ├── connectivity/
│   ├── router/           # go_router — todas as rotas
│   ├── theme/
│   └── di/               # get_it · injectable
├── features/             # domínio — dados, lógica, estado
│   ├── auth/
│   ├── shelf/
│   ├── book/
│   ├── community/
│   ├── dna/
│   └── recommendation/
├── screens/              # telas — composição de features
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

---

## A Distinção Feature × Screen

| | `features/` | `screens/` |
|---|---|---|
| O que é | domínio de negócio | tela do app |
| Contém | data, domain, bloc | widgets + composição de Blocs |
| Conhece | só a si mesmo | múltiplas features |
| Exemplo | `ShelfBloc`, `ShelfRepository` | `FeedScreen` usando `ShelfBloc` + `CommunityBloc` |

**Regra de importação:**
```
features/  →  nunca importa nada de screens/
screens/   →  pode importar qualquer feature
shared/    →  não importa features nem screens
```

---

## Estrutura de uma Feature

```
features/
└── shelf/
    ├── data/
    │   ├── shelf_local_datasource.dart
    │   ├── shelf_remote_datasource.dart
    │   ├── shelf_repository.dart
    │   └── models/
    │       └── shelf_model.dart
    ├── domain/
    │   ├── shelf.dart              # entity / aggregate root
    │   └── value_objects/
    │       ├── reading_progress.dart
    │       └── rating.dart
    └── bloc/
        ├── shelf_bloc.dart
        ├── shelf_event.dart
        └── shelf_state.dart
```

A feature **não tem** pasta `presentation/pages/` — as telas vivem em `screens/`.

---

## Estrutura de uma Screen

```
screens/
├── feed/
│   ├── feed_screen.dart
│   └── widgets/
│       ├── feed_post_card.dart       # usa CommunityBloc + BookBloc
│       └── feed_reading_update.dart  # usa ShelfBloc
│
├── shelf/
│   ├── shelf_list_screen.dart
│   ├── shelf_detail_screen.dart
│   ├── reading_progress_screen.dart
│   └── widgets/
│       ├── shelf_item_card.dart
│       └── shelf_progress_bar.dart
│
├── community/
│   ├── community_list_screen.dart
│   ├── community_detail_screen.dart
│   ├── chat_screen.dart
│   └── widgets/
│       ├── community_card.dart
│       └── chat_message_bubble.dart
│
├── recommendation/
│   ├── recommendation_screen.dart
│   ├── dice_screen.dart
│   └── widgets/
│       └── book_match_card.dart
│
└── profile/
    ├── profile_screen.dart
    ├── edit_profile_screen.dart
    ├── dna_screen.dart
    └── widgets/
        └── dna_genre_bar.dart
```

Widgets **específicos de uma screen** ficam em `screens/{screen}/widgets/`.
Widgets **reutilizados entre screens** vão para `shared/widgets/`.

---

## Como uma Screen Consome Múltiplas Features

A screen monta o contexto de Blocs. Os Blocs continuam vivendo em suas features.

```dart
// screens/feed/feed_screen.dart
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

// screens/feed/widgets/feed_post_card.dart
class FeedPostCard extends StatelessWidget {
  final Post post;
  const FeedPostCard({required this.post});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<BookBloc, BookState>(
      builder: (context, bookState) {
        return BlocBuilder<CommunityBloc, CommunityState>(
          builder: (context, communityState) {
            // monta o card com dados das duas features
          },
        );
      },
    );
  }
}
```

---

## Responsabilidade de Cada Camada

### `domain/` — regras de negócio puras

Zero dependência de Flutter, Dio, Drift ou qualquer lib externa.

```dart
// ✅ CORRETO — regra de negócio na entity
class Shelf {
  final List<ShelfItem> items;
  bool containsBook(int bookId) =>
    items.any((i) => i.bookId == bookId);
}

// ✅ CORRETO — value object com validação
class Rating {
  final int value;
  const Rating(this.value) : assert(value >= 1 && value <= 5);
  bool get isPositive => value >= 4;
}

// ❌ ERRADO — lógica de negócio no Bloc
if (state.shelf.items.any((i) => i.bookId == event.bookId)) {
  // isso deveria estar na entity Shelf
}
```

---

### `data/models/` — serialização

```dart
class ShelfModel {
  factory ShelfModel.fromJson(Map<String, dynamic> json) => ...
  factory ShelfModel.fromLocal(ShelfLocalData row) => ...
  Shelf toEntity() => ...
}
```

---

### `data/{f}_local_datasource.dart` — banco local (Drift)

```dart
// ✅ só fala com Drift
class ShelfLocalDatasource {
  Future<List<ShelfModel>> getShelves(int userId) async { ... }
  Future<void> saveShelves(List<ShelfModel> shelves) async { ... }
}
```

---

### `data/{f}_remote_datasource.dart` — API (Dio)

```dart
// ✅ só fala com Dio
class ShelfRemoteDatasource {
  Future<List<ShelfModel>> getShelves(int userId) async { ... }
}
```

---

### `data/{f}_repository.dart` — orquestrador offline-first

```dart
// ✅ sempre lê local primeiro, sincroniza em background
class ShelfRepository {
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
}
```

---

### `bloc/` — estado da feature

```dart
abstract class ShelfState extends Equatable {}
class ShelfInitial extends ShelfState { ... }
class ShelfLoading extends ShelfState { ... }
class ShelfLoaded  extends ShelfState {
  final List<Shelf> shelves;
  final bool isSyncing;
}
class ShelfError   extends ShelfState { final String message; }

// bloc só chama o repository, nunca datasources diretamente
class ShelfBloc extends Bloc<ShelfEvent, ShelfState> {
  final ShelfRepository _repository;
}
```

---

### `screens/` — composição e UI

```dart
// ✅ screen monta o contexto de Blocs
class ShelfListScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => GetIt.I<ShelfBloc>()..add(LoadShelves()),
      child: const ShelfListView(),
    );
  }
}

// ✅ widget burro — recebe dados, emite callbacks
class ShelfItemCard extends StatelessWidget {
  final Shelf shelf;
  final VoidCallback onTap;
}

// ❌ widget acessando repository diretamente
class ShelfItemCard extends StatelessWidget {
  void _handleTap() {
    GetIt.I<ShelfRepository>().deleteShelf(...); // nunca
  }
}
```

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

## Regras de Ouro

| Pergunta | Resposta |
|---|---|
| Onde coloco uma regra de negócio? | `features/{f}/domain/` |
| Onde coloco uma chamada de API? | `features/{f}/data/{f}_remote_datasource.dart` |
| Onde coloco uma query no banco? | `features/{f}/data/{f}_local_datasource.dart` |
| Onde decido local ou remote? | `features/{f}/data/{f}_repository.dart` |
| Onde gerencio o estado de uma feature? | `features/{f}/bloc/{f}_bloc.dart` |
| Onde monto a tela com múltiplos Blocs? | `screens/{screen}/{screen}_screen.dart` |
| Onde ficam widgets de uma tela? | `screens/{screen}/widgets/` |
| Onde ficam widgets reutilizados? | `shared/widgets/` |
| Uma feature pode importar outra feature? | **Nunca** |
| Uma screen pode importar múltiplas features? | **Sim, é o objetivo** |
| Um widget pode chamar o repository? | **Nunca** |
| O Bloc pode chamar o datasource diretamente? | **Nunca** |

---

## Fluxo de Dados

```
Screen
  └── monta MultiBlocProvider com features necessárias
        └── Widget
              └── dispara Event via context.read<Bloc>()
                    └── Bloc (features/)
                          └── chama Repository
                                ├── LocalDatasource (Drift) ← sempre primeiro
                                └── RemoteDatasource (Dio)  ← quando online
                          └── emite State
                    └── Widget reage ao State via BlocBuilder
```

---

## Nomenclatura

| Arquivo | Padrão |
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
