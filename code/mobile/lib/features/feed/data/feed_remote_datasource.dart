import 'package:dio/dio.dart';

import 'models/feed_page_model.dart';
import 'models/review_model.dart';

class FeedRemoteDatasource {
  final Dio _dio;

  const FeedRemoteDatasource(this._dio);

  Future<FeedPageModel> getFeed({
    required int userId,
    String? cursor,
    int size = 20,
  }) async {
    final queryParameters = <String, dynamic>{'userId': userId, 'size': size};
    if (cursor != null) {
      queryParameters['cursor'] = cursor;
    }
    final response = await _dio.get('/feed', queryParameters: queryParameters);
    return FeedPageModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<ReviewModel> createReview({
    required int bookId,
    required int rating,
    required String text,
  }) async {
    final formData = FormData.fromMap({
      'bookId': bookId.toString(),
      'rating': rating.toString(),
      'text': text,
    });
    final response = await _dio.post(
      '/feed/reviews',
      data: formData,
      options: Options(contentType: 'multipart/form-data'),
    );
    return ReviewModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<ReviewModel> updateReview({
    required int reviewId,
    required int rating,
    required String text,
  }) async {
    final formData = FormData.fromMap({
      'rating': rating.toString(),
      'text': text,
    });
    final response = await _dio.put(
      '/feed/reviews/$reviewId',
      data: formData,
      options: Options(contentType: 'multipart/form-data'),
    );
    return ReviewModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<List<ReviewModel>> getUserReviews({
    required int userId,
    int page = 0,
    int size = 100,
  }) async {
    final response = await _dio.get(
      '/feed/reviews/user/$userId',
      queryParameters: {'page': page, 'size': size, 'sort': 'createdAt,desc'},
    );
    final data = response.data as Map<String, dynamic>;
    final content = data['content'];
    if (content is! List) return const [];
    return content
        .map((item) => ReviewModel.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<bool> toggleReviewLike(int reviewId) async {
    final response = await _dio.post('/feed/reviews/$reviewId/like');
    final data = response.data as Map<String, dynamic>;
    return (data['liked'] as bool?) ?? false;
  }
}
