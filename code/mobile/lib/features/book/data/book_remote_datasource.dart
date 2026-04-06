import 'package:dio/dio.dart';
import 'models/book_model.dart';

/// Só fala com Dio — endpoints do BookController no backend.
class BookRemoteDatasource {
  final Dio _dio;
  const BookRemoteDatasource(this._dio);

  /// GET /books/search?q={query} → List[BookResponse]
  Future<List<BookModel>> searchBooks(String query) async {
    final response = await _dio.get(
      '/books/search',
      queryParameters: {'q': query},
    );
    final data = response.data as List<dynamic>;
    return data
        .map((json) => BookModel.fromJson(json as Map<String, dynamic>))
        .toList();
  }

  /// GET /books/suggest?q={query} → List[BookSuggestResponse]
  Future<List<BookModel>> suggestBooks(String query) async {
    final response = await _dio.get(
      '/books/suggest',
      queryParameters: {'q': query},
    );
    final data = response.data as List<dynamic>;
    return data
        .map((json) => BookModel.fromJson(json as Map<String, dynamic>))
        .toList();
  }

  /// GET /books/{id} → BookResponse
  Future<BookModel> getById(int id) async {
    final response = await _dio.get('/books/$id');
    return BookModel.fromJson(response.data as Map<String, dynamic>);
  }
}
