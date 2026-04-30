import 'package:flutter_bloc/flutter_bloc.dart';

import '../data/feed_repository.dart';
import '../domain/feed_item.dart';
import 'feed_event.dart';
import 'feed_state.dart';

class FeedBloc extends Bloc<FeedEvent, FeedState> {
  final FeedRepository _repository;

  FeedBloc(this._repository) : super(FeedInitial()) {
    on<FeedLoadRequested>(_onLoad);
    on<FeedLoadMoreRequested>(_onLoadMore);
    on<FeedReviewLikeToggled>(_onToggleLike);
  }

  Future<void> _onLoad(FeedLoadRequested event, Emitter<FeedState> emit) async {
    if (!event.refresh) emit(FeedLoading());
    try {
      final page = await _repository.getFeed(userId: event.userId);
      emit(
        FeedLoaded(
          items: page.items,
          nextCursor: page.nextCursor,
          hasMore: page.hasMore,
        ),
      );
    } catch (_) {
      emit(FeedError('Erro ao carregar o feed.'));
    }
  }

  Future<void> _onLoadMore(
    FeedLoadMoreRequested event,
    Emitter<FeedState> emit,
  ) async {
    final current = state;
    if (current is! FeedLoaded ||
        current.isLoadingMore ||
        !current.hasMore ||
        current.nextCursor == null) {
      return;
    }

    emit(current.copyWith(isLoadingMore: true));
    try {
      final page = await _repository.getFeed(
        userId: event.userId,
        cursor: current.nextCursor,
      );
      emit(
        FeedLoaded(
          items: [...current.items, ...page.items],
          nextCursor: page.nextCursor,
          hasMore: page.hasMore,
        ),
      );
    } catch (_) {
      emit(current.copyWith(isLoadingMore: false));
    }
  }

  Future<void> _onToggleLike(
    FeedReviewLikeToggled event,
    Emitter<FeedState> emit,
  ) async {
    final current = state;
    if (current is! FeedLoaded) return;

    try {
      final liked = await _repository.toggleReviewLike(event.reviewId);
      final items = current.items.map((item) {
        if (item.content.id != event.reviewId) return item;
        final delta = liked ? 1 : -1;
        return FeedItem(
          contentId: item.contentId,
          contentType: item.contentType,
          authorId: item.authorId,
          authorUsername: item.authorUsername,
          authorAvatarUrl: item.authorAvatarUrl,
          score: item.score,
          createdAt: item.createdAt,
          content: item.content.copyWith(
            likeCount: (item.content.likeCount + delta)
                .clamp(0, 1 << 31)
                .toInt(),
          ),
        );
      }).toList();
      emit(current.copyWith(items: items));
    } catch (_) {}
  }
}
