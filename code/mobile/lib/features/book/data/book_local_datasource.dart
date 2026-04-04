import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'models/book_model.dart';

/// Cache local de livros via SharedPreferences.
/// Armazena livros já buscados para acesso offline.
class BookLocalDatasource {
  static const _key = 'book_cache';

  final SharedPreferences _prefs;
  const BookLocalDatasource(this._prefs);

  /// Retorna todos os livros salvos no cache.
  List<BookModel> getCachedBooks() {
    final raw = _prefs.getString(_key);
    if (raw == null) return [];
    final list = jsonDecode(raw) as List<dynamic>;
    return list
        .map((json) => BookModel.fromJson(json as Map<String, dynamic>))
        .toList();
  }

  /// Filtra livros do cache que contenham [query] no título ou autores.
  List<BookModel> searchCached(String query) {
    final q = query.toLowerCase();
    return getCachedBooks().where((book) {
      final titleMatch = book.title.toLowerCase().contains(q);
      final authorMatch =
          book.authors.any((a) => a.toLowerCase().contains(q));
      return titleMatch || authorMatch;
    }).toList();
  }

  /// Salva livros no cache (merge: adiciona novos, atualiza existentes).
  Future<void> saveBooks(List<BookModel> books) async {
    final existing = getCachedBooks();
    final map = {for (final b in existing) b.id: b};
    for (final b in books) {
      map[b.id] = b;
    }
    final json = jsonEncode(map.values.map((b) => b.toJson()).toList());
    await _prefs.setString(_key, json);
  }
}
