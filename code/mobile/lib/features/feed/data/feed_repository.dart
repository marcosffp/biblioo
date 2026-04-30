import 'package:biblioo/features/feed/domain/feed_item.dart';
import 'package:biblioo/features/feed/domain/review.dart';

import 'feed_local_datasource.dart';
import 'feed_remote_datasource.dart';

class FeedRepository {
  final FeedRemoteDatasource _remote;
  final FeedLocalDatasource _local;

  const FeedRepository(this._remote, this._local);

  Future<FeedPage> getFeed({
    required int userId,
    String? cursor,
    int size = 20,
  }) async {
    try {
      final page = await _remote.getFeed(
        userId: userId,
        cursor: cursor,
        size: size,
      );
      if (cursor == null) {
        await _local.saveFeed(userId, page.items);
      }
      return FeedPage(
        items: page.items.map((item) => item.toEntity()).toList(),
        nextCursor: page.nextCursor,
        hasMore: page.hasMore,
      );
    } catch (_) {
      if (cursor != null) rethrow;
      final cached = _local.getCachedFeed(userId);
      return FeedPage(
        items: cached.map((item) => item.toEntity()).toList(),
        nextCursor: null,
        hasMore: false,
      );
    }
  }

  Future<Review?> getMyReviewForBook({
    required int userId,
    required int bookId,
  }) async {
    final reviews = await _remote.getUserReviews(userId: userId);
    for (final review in reviews) {
      if (review.bookId == bookId) return review.toEntity();
    }
    return null;
  }

  Future<Review> saveReview({
    int? reviewId,
    required int bookId,
    required int rating,
    required String text,
  }) async {
    final review = reviewId == null
        ? await _remote.createReview(bookId: bookId, rating: rating, text: text)
        : await _remote.updateReview(
            reviewId: reviewId,
            rating: rating,
            text: text,
          );
    return review.toEntity();
  }

  Future<bool> toggleReviewLike(int reviewId) {
    return _remote.toggleReviewLike(reviewId);
  }
}

class FeedPage {
  final List<FeedItem> items;
  final String? nextCursor;
  final bool hasMore;

  const FeedPage({required this.items, this.nextCursor, required this.hasMore});
}
