abstract class ReviewEvent {}

class ReviewLoadForBookRequested extends ReviewEvent {
  final int userId;
  final int bookId;

  ReviewLoadForBookRequested({required this.userId, required this.bookId});
}

class ReviewSaveRequested extends ReviewEvent {
  final int? reviewId;
  final int bookId;
  final int rating;
  final String text;

  ReviewSaveRequested({
    this.reviewId,
    required this.bookId,
    required this.rating,
    required this.text,
  });
}

class ReviewCleared extends ReviewEvent {}
