import 'package:biblioo/features/book/domain/book.dart';
import 'book_local_datasource.dart';
import 'book_remote_datasource.dart';

/// Orquestrador offline-first para busca de livros.
/// Prioriza remote em buscas novas; fallback para cache local.
class BookRepository {
  final BookRemoteDatasource _remote;
  final BookLocalDatasource _local;

  const BookRepository(this._remote, this._local);

  List<Book> getCachedBooks() {
    final cached = _local.getCachedBooks();
    return cached.map((model) => model.toEntity()).toList();
  }

  /// Busca livros por query (título, autor ou ISBN).
  /// Estratégia: remote-first → salva no cache → fallback local.
  Future<List<Book>> searchBooks(String query) async {
    // Tenta buscar do servidor primeiro
    try {
      final remote = await _remote.searchBooks(query);
      // Salva no cache para buscas futuras / offline
      if (remote.isNotEmpty) {
        await _local.saveBooks(remote);
      }
      return remote.map((m) => m.toEntity()).toList();
    } catch (_) {
      // Fallback: filtra do cache local
      final local = _local.searchCached(query);
      return local.map((m) => m.toEntity()).toList();
    }
  }

  /// Busca um livro por ID.
  Future<Book> getById(int id) async {
    final cached = _local.getCachedBooks();
    final match = cached.where((b) => b.id == id);
    if (match.isNotEmpty) return match.first.toEntity();

    try {
      final remote = await _remote.getById(id);
      await _local.saveBooks([remote]);
      return remote.toEntity();
    } catch (_) {
      rethrow;
    }
  }
}
