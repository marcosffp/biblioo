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
    on<FeedReviewLikeToggled>(_onToggleReviewLike);
    on<FeedPostLikeToggled>(_onTogglePostLike);
    on<FeedReviewDeleteRequested>(_onDeleteReview);
    on<FeedPostDeleteRequested>(_onDeletePost);
    on<FeedCommentCountChanged>(_onCommentCountChanged);
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

  Future<void> _onToggleReviewLike(
    FeedReviewLikeToggled event,
    Emitter<FeedState> emit,
  ) async {
    final current = state;
    if (current is! FeedLoaded) return;

    try {
      final liked = await _repository.toggleReviewLike(event.reviewId);
      emit(
        current.copyWith(
          items: _updateLike(current.items, event.reviewId, 'REVIEW', liked),
          clearActionError: true,
        ),
      );
    } catch (_) {
      emit(current.copyWith(actionError: 'Nao foi possivel curtir.'));
    }
  }

  Future<void> _onTogglePostLike(
    FeedPostLikeToggled event,
    Emitter<FeedState> emit,
  ) async {
    final current = state;
    if (current is! FeedLoaded) return;

    try {
      final liked = await _repository.togglePostLike(event.postId);
      emit(
        current.copyWith(
          items: _updateLike(current.items, event.postId, 'POST', liked),
          clearActionError: true,
        ),
      );
    } catch (_) {
      emit(current.copyWith(actionError: 'Nao foi possivel curtir.'));
    }
  }

  Future<void> _onDeleteReview(
    FeedReviewDeleteRequested event,
    Emitter<FeedState> emit,
  ) async {
    final current = state;
    if (current is! FeedLoaded) return;

    try {
      await _repository.deleteReview(event.reviewId);
      emit(
        current.copyWith(
          items: _removeItem(current.items, event.reviewId, 'REVIEW'),
          clearActionError: true,
        ),
      );
    } catch (_) {
      emit(
        current.copyWith(actionError: 'Nao foi possivel excluir a avaliacao.'),
      );
    }
  }

  Future<void> _onDeletePost(
    FeedPostDeleteRequested event,
    Emitter<FeedState> emit,
  ) async {
    final current = state;
    if (current is! FeedLoaded) return;

    try {
      await _repository.deletePost(event.postId);
      emit(
        current.copyWith(
          items: _removeItem(current.items, event.postId, 'POST'),
          clearActionError: true,
        ),
      );
    } catch (_) {
      emit(current.copyWith(actionError: 'Nao foi possivel excluir o post.'));
    }
  }

  void _onCommentCountChanged(
    FeedCommentCountChanged event,
    Emitter<FeedState> emit,
  ) {
    final current = state;
    if (current is! FeedLoaded) return;
    emit(
      current.copyWith(
        items: _updateCommentCount(
          current.items,
          event.contentId,
          event.contentType,
          event.delta,
        ),
        clearActionError: true,
      ),
    );
  }

  List<FeedItem> _updateLike(
    List<FeedItem> items,
    int contentId,
    String contentType,
    bool liked,
  ) {
    final delta = liked ? 1 : -1;
    return items.map((item) {
      if (item.content.id != contentId || item.contentType != contentType) {
        return item;
      }
      return FeedItem(
        contentId: item.contentId,
        contentType: item.contentType,
        authorId: item.authorId,
        authorUsername: item.authorUsername,
        authorAvatarUrl: item.authorAvatarUrl,
        score: item.score,
        createdAt: item.createdAt,
        content: item.content.copyWith(
          likeCount: (item.content.likeCount + delta).clamp(0, 1 << 31).toInt(),
          likedByCurrentUser: liked,
        ),
      );
    }).toList();
  }

  List<FeedItem> _updateCommentCount(
    List<FeedItem> items,
    int contentId,
    String contentType,
    int delta,
  ) {
    return items.map((item) {
      if (item.content.id != contentId || item.contentType != contentType) {
        return item;
      }
      return FeedItem(
        contentId: item.contentId,
        contentType: item.contentType,
        authorId: item.authorId,
        authorUsername: item.authorUsername,
        authorAvatarUrl: item.authorAvatarUrl,
        score: item.score,
        createdAt: item.createdAt,
        content: item.content.copyWith(
          commentCount: (item.content.commentCount + delta)
              .clamp(0, 1 << 31)
              .toInt(),
        ),
      );
    }).toList();
  }

  List<FeedItem> _removeItem(
    List<FeedItem> items,
    int contentId,
    String contentType,
  ) {
    return items
        .where(
          (item) =>
              item.content.id != contentId || item.contentType != contentType,
        )
        .toList();
  }
}
