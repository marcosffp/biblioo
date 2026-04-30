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
