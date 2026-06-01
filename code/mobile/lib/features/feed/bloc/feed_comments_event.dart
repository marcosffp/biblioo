abstract class FeedCommentsEvent {}

class FeedCommentsLoadRequested extends FeedCommentsEvent {
  final int contentId;
  final String contentType;

  FeedCommentsLoadRequested({
    required this.contentId,
    required this.contentType,
  });
}

class FeedCommentsLoadMoreRequested extends FeedCommentsEvent {}

class FeedCommentCreateRequested extends FeedCommentsEvent {
  final String text;

  FeedCommentCreateRequested(this.text);
}

class FeedCommentReplyCreateRequested extends FeedCommentsEvent {
  final int commentId;
  final String text;

  FeedCommentReplyCreateRequested({
    required this.commentId,
    required this.text,
  });
}

class FeedCommentDeleteRequested extends FeedCommentsEvent {
  final int commentId;

  FeedCommentDeleteRequested(this.commentId);
}

class FeedCommentLikeToggled extends FeedCommentsEvent {
  final int commentId;

  FeedCommentLikeToggled(this.commentId);
}

class FeedCommentRepliesLoadRequested extends FeedCommentsEvent {
  final int commentId;

  FeedCommentRepliesLoadRequested(this.commentId);
}

class FeedCommentRepliesLoadMoreRequested extends FeedCommentsEvent {
  final int commentId;

  FeedCommentRepliesLoadMoreRequested(this.commentId);
}
