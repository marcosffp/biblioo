import 'package:flutter_bloc/flutter_bloc.dart';

import '../data/feed_repository.dart';
import '../domain/comment.dart';
import 'feed_comments_event.dart';
import 'feed_comments_state.dart';

class FeedCommentsBloc extends Bloc<FeedCommentsEvent, FeedCommentsState> {
  final FeedRepository _repository;

  FeedCommentsBloc(this._repository) : super(FeedCommentsInitial()) {
    on<FeedCommentsLoadRequested>(_onLoad);
    on<FeedCommentsLoadMoreRequested>(_onLoadMore);
    on<FeedCommentCreateRequested>(_onCreate);
    on<FeedCommentReplyCreateRequested>(_onCreateReply);
    on<FeedCommentDeleteRequested>(_onDelete);
    on<FeedCommentLikeToggled>(_onToggleLike);
    on<FeedCommentRepliesLoadRequested>(_onLoadReplies);
    on<FeedCommentRepliesLoadMoreRequested>(_onLoadMoreReplies);
  }

  Future<void> _onLoad(
    FeedCommentsLoadRequested event,
    Emitter<FeedCommentsState> emit,
  ) async {
    emit(FeedCommentsLoading());
    try {
      final page = await _repository.getComments(
        contentId: event.contentId,
        contentType: event.contentType,
      );
      emit(
        FeedCommentsLoaded(
          contentId: event.contentId,
          contentType: event.contentType,
          comments: page.comments,
          last: page.last,
        ),
      );
    } catch (_) {
      emit(FeedCommentsError('Nao foi possivel carregar os comentarios.'));
    }
  }

  Future<void> _onLoadMore(
    FeedCommentsLoadMoreRequested event,
    Emitter<FeedCommentsState> emit,
  ) async {
    final current = state;
    if (current is! FeedCommentsLoaded ||
        current.isLoadingMore ||
        current.last) {
      return;
    }

    emit(current.copyWith(isLoadingMore: true, clearActionError: true));
    try {
      final nextPage = current.page + 1;
      final page = await _repository.getComments(
        contentId: current.contentId,
        contentType: current.contentType,
        page: nextPage,
      );
      emit(
        current.copyWith(
          comments: [...current.comments, ...page.comments],
          last: page.last,
          page: nextPage,
          isLoadingMore: false,
        ),
      );
    } catch (_) {
      emit(
        current.copyWith(
          isLoadingMore: false,
          actionError: 'Nao foi possivel carregar mais comentarios.',
        ),
      );
    }
  }

  Future<void> _onCreate(
    FeedCommentCreateRequested event,
    Emitter<FeedCommentsState> emit,
  ) async {
    final current = state;
    if (current is! FeedCommentsLoaded || current.isSubmitting) return;
    final text = event.text.trim();
    if (text.isEmpty) return;

    emit(current.copyWith(isSubmitting: true, clearActionError: true));
    try {
      final comment = await _repository.createComment(
        contentId: current.contentId,
        contentType: current.contentType,
        text: text,
      );
      emit(
        current.copyWith(
          comments: [comment, ...current.comments],
          isSubmitting: false,
          commentCountDelta: 1,
        ),
      );
    } catch (_) {
      emit(
        current.copyWith(
          isSubmitting: false,
          actionError: 'Nao foi possivel enviar o comentario.',
        ),
      );
    }
  }

  Future<void> _onCreateReply(
    FeedCommentReplyCreateRequested event,
    Emitter<FeedCommentsState> emit,
  ) async {
    final current = state;
    if (current is! FeedCommentsLoaded) return;
    final text = event.text.trim();
    if (text.isEmpty) return;

    try {
      final reply = await _repository.createCommentReply(
        commentId: event.commentId,
        text: text,
      );
      final replies =
          current.repliesByCommentId[event.commentId] ??
          const CommentRepliesState();
      final nextReplies = {
        ...current.repliesByCommentId,
        event.commentId: replies.copyWith(
          replies: [...replies.replies, reply],
          last: replies.last,
        ),
      };
      emit(
        current.copyWith(
          repliesByCommentId: nextReplies,
          commentCountDelta: 1,
          clearActionError: true,
        ),
      );
    } catch (_) {
      emit(
        current.copyWith(actionError: 'Nao foi possivel enviar a resposta.'),
      );
    }
  }

  Future<void> _onDelete(
    FeedCommentDeleteRequested event,
    Emitter<FeedCommentsState> emit,
  ) async {
    final current = state;
    if (current is! FeedCommentsLoaded) return;

    try {
      await _repository.deleteComment(event.commentId);
      final isTopLevel = current.comments.any((c) => c.id == event.commentId);
      if (isTopLevel) {
        emit(
          current.copyWith(
            comments: current.comments
                .map(
                  (comment) => comment.id == event.commentId
                      ? comment.copyWith(deleted: true, text: '')
                      : comment,
                )
                .toList(),
            commentCountDelta: -1,
            clearActionError: true,
          ),
        );
        return;
      }

      final nextReplies = <int, CommentRepliesState>{};
      for (final entry in current.repliesByCommentId.entries) {
        nextReplies[entry.key] = entry.value.copyWith(
          replies: entry.value.replies
              .where((reply) => reply.id != event.commentId)
              .toList(),
        );
      }
      emit(
        current.copyWith(
          repliesByCommentId: nextReplies,
          commentCountDelta: -1,
          clearActionError: true,
        ),
      );
    } catch (_) {
      emit(
        current.copyWith(actionError: 'Nao foi possivel excluir o comentario.'),
      );
    }
  }

  Future<void> _onToggleLike(
    FeedCommentLikeToggled event,
    Emitter<FeedCommentsState> emit,
  ) async {
    final current = state;
    if (current is! FeedCommentsLoaded) return;

    try {
      final liked = await _repository.toggleCommentLike(event.commentId);
      emit(
        current.copyWith(
          comments: _updateLike(current.comments, event.commentId, liked),
          repliesByCommentId: _updateReplyLike(
            current.repliesByCommentId,
            event.commentId,
            liked,
          ),
          clearActionError: true,
        ),
      );
    } catch (_) {
      emit(current.copyWith(actionError: 'Nao foi possivel curtir.'));
    }
  }

  Future<void> _onLoadReplies(
    FeedCommentRepliesLoadRequested event,
    Emitter<FeedCommentsState> emit,
  ) async {
    final current = state;
    if (current is! FeedCommentsLoaded) return;
    final existing = current.repliesByCommentId[event.commentId];
    if (existing != null &&
        (existing.isLoading || existing.replies.isNotEmpty)) {
      return;
    }

    final nextReplies = {
      ...current.repliesByCommentId,
      event.commentId:
          (current.repliesByCommentId[event.commentId] ??
                  const CommentRepliesState())
              .copyWith(isLoading: true),
    };
    emit(
      current.copyWith(repliesByCommentId: nextReplies, clearActionError: true),
    );

    try {
      final page = await _repository.getCommentReplies(event.commentId);
      final latest = state;
      if (latest is! FeedCommentsLoaded) return;
      emit(
        latest.copyWith(
          repliesByCommentId: {
            ...latest.repliesByCommentId,
            event.commentId: CommentRepliesState(
              replies: page.comments,
              last: page.last,
            ),
          },
        ),
      );
    } catch (_) {
      emit(
        current.copyWith(actionError: 'Nao foi possivel carregar respostas.'),
      );
    }
  }

  Future<void> _onLoadMoreReplies(
    FeedCommentRepliesLoadMoreRequested event,
    Emitter<FeedCommentsState> emit,
  ) async {
    final current = state;
    if (current is! FeedCommentsLoaded) return;
    final replies = current.repliesByCommentId[event.commentId];
    if (replies == null || replies.last || replies.isLoadingMore) return;

    emit(
      current.copyWith(
        repliesByCommentId: {
          ...current.repliesByCommentId,
          event.commentId: replies.copyWith(isLoadingMore: true),
        },
        clearActionError: true,
      ),
    );

    try {
      final nextPage = replies.page + 1;
      final page = await _repository.getCommentReplies(
        event.commentId,
        page: nextPage,
      );
      emit(
        current.copyWith(
          repliesByCommentId: {
            ...current.repliesByCommentId,
            event.commentId: replies.copyWith(
              replies: [...replies.replies, ...page.comments],
              isLoadingMore: false,
              last: page.last,
              page: nextPage,
            ),
          },
        ),
      );
    } catch (_) {
      emit(
        current.copyWith(actionError: 'Nao foi possivel carregar respostas.'),
      );
    }
  }

  List<FeedComment> _updateLike(
    List<FeedComment> comments,
    int commentId,
    bool liked,
  ) {
    final delta = liked ? 1 : -1;
    return comments
        .map(
          (comment) => comment.id == commentId
              ? comment.copyWith(
                  likeCount: (comment.likeCount + delta)
                      .clamp(0, 1 << 31)
                      .toInt(),
                  likedByCurrentUser: liked,
                )
              : comment,
        )
        .toList();
  }

  Map<int, CommentRepliesState> _updateReplyLike(
    Map<int, CommentRepliesState> repliesByCommentId,
    int commentId,
    bool liked,
  ) {
    final updated = <int, CommentRepliesState>{};
    for (final entry in repliesByCommentId.entries) {
      updated[entry.key] = entry.value.copyWith(
        replies: _updateLike(entry.value.replies, commentId, liked),
      );
    }
    return updated;
  }
}
