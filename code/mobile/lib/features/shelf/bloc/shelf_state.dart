import 'package:biblioo/features/shelf/domain/shelf.dart';
import 'package:biblioo/features/shelf/domain/shelf_item.dart';

abstract class ShelfState {}

class ShelfInitial extends ShelfState {}

class ShelfLoading extends ShelfState {}

/// Lista de estantes carregada com sucesso.
class ShelfLoaded extends ShelfState {
  final List<Shelf> shelves;
  ShelfLoaded(this.shelves);
}

class ShelfError extends ShelfState {
  final String message;
  ShelfError(this.message);
}

// ── Item states ──────────────────────────────────────────

class ShelfItemsLoading extends ShelfState {}

/// Itens de uma estante específica carregados.
class ShelfItemsLoaded extends ShelfState {
  final int shelfId;
  final List<ShelfItem> items;
  ShelfItemsLoaded({required this.shelfId, required this.items});
}

class ShelfItemsError extends ShelfState {
  final String message;
  ShelfItemsError(this.message);
}

// ── Mutation feedback states ─────────────────────────────

/// Mutação em andamento (create, update, delete, patch).
class ShelfMutating extends ShelfState {}

/// Mutação concluída com sucesso — a screen deve recarregar a lista.
class ShelfMutationSuccess extends ShelfState {
  final String message;
  ShelfMutationSuccess(this.message);
}

/// Atualização de progresso concluída — inclui o item atualizado pelo servidor.
/// A screen NÃO deve fazer reload: o bloc já atualizou ShelfItemsLoaded em lugar.
class ShelfProgressUpdateSuccess extends ShelfState {
  final ShelfItem updatedItem;
  ShelfProgressUpdateSuccess(this.updatedItem);
}
