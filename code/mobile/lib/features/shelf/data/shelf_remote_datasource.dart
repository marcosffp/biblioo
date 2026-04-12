import 'package:biblioo/features/shelf/data/models/shelf_item_model.dart';
import 'package:biblioo/features/shelf/data/models/shelf_model.dart';
import 'package:biblioo/features/shelf/domain/reading_status.dart';
import 'package:dio/dio.dart';

/// Só fala com Dio — endpoints do ShelfController e ShelfItemController.
class ShelfRemoteDatasource {
  final Dio _dio;
  const ShelfRemoteDatasource(this._dio);

  // ── Shelf CRUD ─────────────────────────────────────────

  /// GET /shelves
  Future<List<ShelfModel>> getShelves() async {
    final response = await _dio.get('/shelves');
    final data = response.data as List<dynamic>;
    return data
        .map((json) => ShelfModel.fromJson(json as Map<String, dynamic>))
        .toList();
  }

  /// GET /shelves/{shelfId}
  Future<ShelfModel> getShelf(int shelfId) async {
    final response = await _dio.get('/shelves/$shelfId');
    return ShelfModel.fromJson(response.data as Map<String, dynamic>);
  }

  /// POST /shelves — body: { name, description }
  Future<ShelfModel> createShelf({
    required String name,
    String? description,
  }) async {
    final response = await _dio.post('/shelves', data: {
      'name': name,
      'description': description,
    });
    return ShelfModel.fromJson(response.data as Map<String, dynamic>);
  }

  /// PUT /shelves/{shelfId} — body: { name, description }
  Future<ShelfModel> updateShelf({
    required int shelfId,
    required String name,
    String? description,
  }) async {
    final response = await _dio.put('/shelves/$shelfId', data: {
      'name': name,
      'description': description,
    });
    return ShelfModel.fromJson(response.data as Map<String, dynamic>);
  }

  /// DELETE /shelves/{shelfId}
  Future<void> deleteShelf(int shelfId) async {
    await _dio.delete('/shelves/$shelfId');
  }

  // ── ShelfItem CRUD ─────────────────────────────────────

  /// GET /shelves/{shelfId}/items
  Future<List<ShelfItemModel>> getItems(int shelfId) async {
    final response = await _dio.get('/shelves/$shelfId/items');
    final data = response.data as List<dynamic>;
    return data
        .map((json) => ShelfItemModel.fromJson(json as Map<String, dynamic>))
        .toList();
  }

  /// GET /shelves/{shelfId}/items/{itemId}
  Future<ShelfItemModel> getItem(int shelfId, int itemId) async {
    final response = await _dio.get('/shelves/$shelfId/items/$itemId');
    return ShelfItemModel.fromJson(response.data as Map<String, dynamic>);
  }

  /// POST /shelves/{shelfId}/items — body: { bookId, initialStatus? }
  Future<ShelfItemModel> addItem({
    required int shelfId,
    required int bookId,
    ReadingStatus? initialStatus,
  }) async {
    final response = await _dio.post('/shelves/$shelfId/items', data: {
      'bookId': bookId,
      if (initialStatus != null) 'initialStatus': initialStatus.toJson(),
    });
    return ShelfItemModel.fromJson(response.data as Map<String, dynamic>);
  }

  /// DELETE /shelves/{shelfId}/items/{itemId}
  Future<void> removeItem(int shelfId, int itemId) async {
    await _dio.delete('/shelves/$shelfId/items/$itemId');
  }

  /// PATCH /shelves/{shelfId}/items/{itemId}/progress — body: { currentPage }
  Future<ShelfItemModel> updateProgress({
    required int shelfId,
    required int itemId,
    required int currentPage,
  }) async {
    final response = await _dio.patch(
      '/shelves/$shelfId/items/$itemId/progress',
      data: {'currentPage': currentPage},
    );
    return ShelfItemModel.fromJson(response.data as Map<String, dynamic>);
  }

  /// PATCH /shelves/{shelfId}/items/{itemId}/status — body: { newStatus }
  Future<ShelfItemModel> changeStatus({
    required int shelfId,
    required int itemId,
    required ReadingStatus newStatus,
  }) async {
    final response = await _dio.patch(
      '/shelves/$shelfId/items/$itemId/status',
      data: {'newStatus': newStatus.toJson()},
    );
    return ShelfItemModel.fromJson(response.data as Map<String, dynamic>);
  }
}
