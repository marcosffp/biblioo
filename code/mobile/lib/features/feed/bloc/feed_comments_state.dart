import 'package:biblioo/features/feed/domain/comment.dart';

class CommentRepliesState {
  final List<FeedComment> replies;
  final bool isLoading;
  final bool isLoadingMore;
  final bool last;
  final int page;

  const CommentRepliesState({
    this.replies = const [],
    this.isLoading = false,
    this.isLoadingMore = false,
    this.last = true,
    this.page = 0,
  });

  CommentRepliesState copyWith({
    List<FeedComment>? replies,
    bool? isLoading,
    bool? isLoadingMore,
    bool? last,
    int? page,
  }) {
    return CommentRepliesState(
      replies: replies ?? this.replies,
      isLoading: isLoading ?? this.isLoading,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      last: last ?? this.last,
      page: page ?? this.page,
    );
  }
}

abstract class FeedCommentsState {}

class FeedCommentsInitial extends FeedCommentsState {}

class FeedCommentsLoading extends FeedCommentsState {}

class FeedCommentsLoaded extends FeedCommentsState {
  final int contentId;
  final String contentType;
  final List<FeedComment> comments;
  final bool isLoadingMore;
  final bool isSubmitting;
  final bool last;
  final int page;
  final Map<int, CommentRepliesState> repliesByCommentId;
  final String? actionError;
  final int commentCountDelta;

  FeedCommentsLoaded({
    required this.contentId,
    required this.contentType,
    required this.comments,
    required this.last,
    this.page = 0,
    this.isLoadingMore = false,
    this.isSubmitting = false,
    this.repliesByCommentId = const {},
    this.actionError,
    this.commentCountDelta = 0,
  });

  FeedCommentsLoaded copyWith({
    List<FeedComment>? comments,
    bool? isLoadingMore,
    bool? isSubmitting,
    bool? last,
    int? page,
    Map<int, CommentRepliesState>? repliesByCommentId,
    String? actionError,
    bool clearActionError = false,
    int commentCountDelta = 0,
  }) {
    return FeedCommentsLoaded(
      contentId: contentId,
      contentType: contentType,
      comments: comments ?? this.comments,
      last: last ?? this.last,
      page: page ?? this.page,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      repliesByCommentId: repliesByCommentId ?? this.repliesByCommentId,
      actionError: clearActionError ? null : actionError ?? this.actionError,
      commentCountDelta: commentCountDelta,
    );
  }
}

class FeedCommentsError extends FeedCommentsState {
  final String message;

  FeedCommentsError(this.message);
}
