import 'package:biblioo/features/feed/domain/review.dart';

abstract class ReviewState {}

class ReviewInitial extends ReviewState {}

class ReviewLoading extends ReviewState {}

class ReviewLoaded extends ReviewState {
  final Review? review;

  ReviewLoaded(this.review);
}

class ReviewSaving extends ReviewState {
  final Review? review;

  ReviewSaving(this.review);
}

class ReviewSaveSuccess extends ReviewState {
  final Review review;

  ReviewSaveSuccess(this.review);
}

class ReviewError extends ReviewState {
  final String message;
  final Review? review;

  ReviewError(this.message, {this.review});
}
