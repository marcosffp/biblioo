abstract class FeedEvent {}

class FeedLoadRequested extends FeedEvent {
  final int userId;
  final bool refresh;

  FeedLoadRequested({required this.userId, this.refresh = false});
}

class FeedLoadMoreRequested extends FeedEvent {
  final int userId;

  FeedLoadMoreRequested({required this.userId});
}

class FeedReviewLikeToggled extends FeedEvent {
  final int reviewId;

  FeedReviewLikeToggled({required this.reviewId});
}

class FeedPostLikeToggled extends FeedEvent {
  final int postId;

  FeedPostLikeToggled({required this.postId});
}

class FeedReviewDeleteRequested extends FeedEvent {
  final int reviewId;

  FeedReviewDeleteRequested({required this.reviewId});
}

class FeedPostDeleteRequested extends FeedEvent {
  final int postId;

  FeedPostDeleteRequested({required this.postId});
}

class FeedCommentCountChanged extends FeedEvent {
  final int contentId;
  final String contentType;
  final int delta;

  FeedCommentCountChanged({
    required this.contentId,
    required this.contentType,
    required this.delta,
  });
}
