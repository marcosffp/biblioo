import 'package:flutter_bloc/flutter_bloc.dart';

import '../data/feed_repository.dart';
import '../domain/review.dart';
import 'review_event.dart';
import 'review_state.dart';

class ReviewBloc extends Bloc<ReviewEvent, ReviewState> {
  final FeedRepository _repository;

  ReviewBloc(this._repository) : super(ReviewInitial()) {
    on<ReviewLoadForBookRequested>(_onLoadForBook);
    on<ReviewSaveRequested>(_onSave);
    on<ReviewCleared>((event, emit) => emit(ReviewInitial()));
  }

  Future<void> _onLoadForBook(
    ReviewLoadForBookRequested event,
    Emitter<ReviewState> emit,
  ) async {
    emit(ReviewLoading());
    try {
      final review = await _repository.getMyReviewForBook(
        userId: event.userId,
        bookId: event.bookId,
      );
      emit(ReviewLoaded(review));
    } catch (_) {
      emit(ReviewError('Erro ao carregar sua avaliacao.'));
    }
  }

  Future<void> _onSave(
    ReviewSaveRequested event,
    Emitter<ReviewState> emit,
  ) async {
    final previous = _currentReview();
    emit(ReviewSaving(previous));
    try {
      final review = await _repository.saveReview(
        reviewId: event.reviewId,
        bookId: event.bookId,
        rating: event.rating,
        text: event.text,
      );
      emit(ReviewSaveSuccess(review));
    } catch (_) {
      emit(
        ReviewError('Nao foi possivel salvar a avaliacao.', review: previous),
      );
    }
  }

  Review? _currentReview() {
    final current = state;
    if (current is ReviewLoaded) return current.review;
    if (current is ReviewSaving) return current.review;
    if (current is ReviewSaveSuccess) return current.review;
    if (current is ReviewError) return current.review;
    return null;
  }
}
