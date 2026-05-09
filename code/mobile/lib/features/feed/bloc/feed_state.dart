import 'package:biblioo/features/feed/domain/feed_item.dart';

abstract class FeedState {}

class FeedInitial extends FeedState {}

class FeedLoading extends FeedState {}

class FeedLoaded extends FeedState {
  final List<FeedItem> items;
  final String? nextCursor;
  final bool hasMore;
  final bool isLoadingMore;
  final String? actionError;

  FeedLoaded({
    required this.items,
    this.nextCursor,
    required this.hasMore,
    this.isLoadingMore = false,
    this.actionError,
  });

  FeedLoaded copyWith({
    List<FeedItem>? items,
    String? nextCursor,
    bool? hasMore,
    bool? isLoadingMore,
    String? actionError,
    bool clearActionError = false,
  }) {
    return FeedLoaded(
      items: items ?? this.items,
      nextCursor: nextCursor ?? this.nextCursor,
      hasMore: hasMore ?? this.hasMore,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      actionError: clearActionError ? null : actionError ?? this.actionError,
    );
  }
}

class FeedError extends FeedState {
  final String message;

  FeedError(this.message);
}
