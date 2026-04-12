import 'package:biblioo/features/collection/data/models/collection_model.dart';
import 'package:dio/dio.dart';

class CollectionRemoteDatasource {
  final Dio _dio;
  const CollectionRemoteDatasource(this._dio);

  Future<List<CollectionModel>> getCollections() async {
    final response = await _dio.get('/collections');
    final data = response.data as List<dynamic>;
    return data
        .map((json) => CollectionModel.fromJson(json as Map<String, dynamic>))
        .toList();
  }

  Future<CollectionModel> getCollection(int id) async {
    final response = await _dio.get('/collections/$id');
    return CollectionModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<CollectionModel> createCollection({
    required String name,
    String? description,
    List<int>? initialShelfIds,
  }) async {
    final response = await _dio.post('/collections', data: {
      'name': name,
      if (description != null) 'description': description,
      if (initialShelfIds != null) 'initialShelfIds': initialShelfIds,
    });
    return CollectionModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<CollectionModel> updateCollection({
    required int id,
    required String name,
    String? description,
  }) async {
    final response = await _dio.put('/collections/$id', data: {
      'name': name,
      'description': description,
    });
    return CollectionModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<void> deleteCollection(int id) async {
    await _dio.delete('/collections/$id');
  }

  Future<CollectionModel> addShelfToCollection(int collectionId, int shelfId) async {
    final response = await _dio.patch(
      '/collections/$collectionId/shelves',
      data: {'shelfId': shelfId},
    );
    return CollectionModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<void> removeShelfFromCollection(int collectionId, int shelfId) async {
    await _dio.delete('/collections/$collectionId/shelves/$shelfId');
  }
}
