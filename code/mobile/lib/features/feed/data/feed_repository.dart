import 'dart:typed_data';

import 'package:biblioo/features/feed/domain/comment.dart';
import 'package:biblioo/features/feed/domain/feed_item.dart';
import 'package:biblioo/features/feed/domain/post.dart';
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

  // ── reviews ──────────────────────────────────────────────────────────────

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
    String? text,
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

  Future<void> deleteReview(int reviewId) {
    return _remote.deleteReview(reviewId);
  }

  // ── posts ────────────────────────────────────────────────────────────────

  Future<Post> createPost({
    required String text,
    int? bookId,
    List<String> tags = const [],
    bool hasSpoiler = false,
    List<Uint8List> images = const [],
    List<String> imageNames = const [],
    Uint8List? gif,
    String? gifName,
  }) async {
    final model = await _remote.createPost(
      text: text,
      bookId: bookId,
      tags: tags,
      hasSpoiler: hasSpoiler,
      images: images,
      imageNames: imageNames,
      gif: gif,
      gifName: gifName,
    );
    return model.toEntity();
  }

  Future<bool> togglePostLike(int postId) {
    return _remote.togglePostLike(postId);
  }

  Future<void> deletePost(int postId) {
    return _remote.deletePost(postId);
  }

  Future<FeedCommentPage> getComments({
    required int contentId,
    required String contentType,
    int page = 0,
  }) async {
    final model = await _remote.getComments(
      contentId: contentId,
      contentType: contentType,
      page: page,
    );
    return model.toEntity();
  }

  Future<FeedComment> createComment({
    required int contentId,
    required String contentType,
    required String text,
  }) async {
    final model = await _remote.createComment(
      contentId: contentId,
      contentType: contentType,
      text: text,
    );
    return model.toEntity();
  }

  Future<void> deleteComment(int commentId) {
    return _remote.deleteComment(commentId);
  }

  Future<bool> toggleCommentLike(int commentId) {
    return _remote.toggleCommentLike(commentId);
  }

  Future<FeedCommentPage> getCommentReplies(
    int commentId, {
    int page = 0,
  }) async {
    final model = await _remote.getCommentReplies(commentId, page: page);
    return model.toEntity();
  }

  Future<FeedComment> createCommentReply({
    required int commentId,
    required String text,
  }) async {
    final model = await _remote.createCommentReply(
      commentId: commentId,
      text: text,
    );
    return model.toEntity();
  }
}

class FeedPage {
  final List<FeedItem> items;
  final String? nextCursor;
  final bool hasMore;

  const FeedPage({required this.items, this.nextCursor, required this.hasMore});
}
