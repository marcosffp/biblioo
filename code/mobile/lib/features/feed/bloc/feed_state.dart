import 'package:biblioo/features/feed/domain/feed_item.dart';

abstract class FeedState {}

class FeedInitial extends FeedState {}

class FeedLoading extends FeedState {}

class FeedLoaded extends FeedState {
  final List<FeedItem> items;
  final String? nextCursor;
  final bool hasMore;
  final bool isLoadingMore;

  FeedLoaded({
    required this.items,
    this.nextCursor,
    required this.hasMore,
    this.isLoadingMore = false,
  });

  FeedLoaded copyWith({
    List<FeedItem>? items,
    String? nextCursor,
    bool? hasMore,
    bool? isLoadingMore,
  }) {
    return FeedLoaded(
      items: items ?? this.items,
      nextCursor: nextCursor ?? this.nextCursor,
      hasMore: hasMore ?? this.hasMore,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
    );
  }
}

class FeedError extends FeedState {
  final String message;

  FeedError(this.message);
}
