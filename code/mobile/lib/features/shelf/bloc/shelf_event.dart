import 'package:biblioo/features/shelf/domain/reading_status.dart';

abstract class ShelfEvent {}

/// Carrega todas as estantes do usuário autenticado.
class ShelfLoadRequested extends ShelfEvent {}

/// Cria uma nova estante.
class ShelfCreateRequested extends ShelfEvent {
  final String name;
  final String? description;
  ShelfCreateRequested({required this.name, this.description});
}

/// Atualiza uma estante existente.
class ShelfUpdateRequested extends ShelfEvent {
  final int shelfId;
  final String name;
  final String? description;
  ShelfUpdateRequested({
    required this.shelfId,
    required this.name,
    this.description,
  });
}

/// Deleta uma estante.
class ShelfDeleteRequested extends ShelfEvent {
  final int shelfId;
  ShelfDeleteRequested(this.shelfId);
}

/// Carrega os itens de uma estante específica.
class ShelfItemsLoadRequested extends ShelfEvent {
  final int shelfId;
  ShelfItemsLoadRequested(this.shelfId);
}

/// Adiciona um livro a uma estante.
class ShelfItemAddRequested extends ShelfEvent {
  final int shelfId;
  final int bookId;
  final ReadingStatus? initialStatus;
  ShelfItemAddRequested({
    required this.shelfId,
    required this.bookId,
    this.initialStatus,
  });
}

/// Remove um livro de uma estante.
class ShelfItemRemoveRequested extends ShelfEvent {
  final int shelfId;
  final int itemId;
  ShelfItemRemoveRequested({required this.shelfId, required this.itemId});
}

/// Atualiza o progresso de leitura de um item.
class ShelfItemProgressUpdated extends ShelfEvent {
  final int shelfId;
  final int itemId;
  final int currentPage;
  ShelfItemProgressUpdated({
    required this.shelfId,
    required this.itemId,
    required this.currentPage,
  });
}

/// Atualiza o status de leitura de um item.
class ShelfItemStatusChanged extends ShelfEvent {
  final int shelfId;
  final int itemId;
  final ReadingStatus newStatus;
  ShelfItemStatusChanged({
    required this.shelfId,
    required this.itemId,
    required this.newStatus,
  });
}
