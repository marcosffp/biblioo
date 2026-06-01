import 'package:biblioo/features/recommendation/domain/because_you_read_result.dart';
import 'package:biblioo/features/recommendation/domain/favorite_genre_now_result.dart';
import 'package:biblioo/features/recommendation/domain/recommended_book.dart';
import 'package:equatable/equatable.dart';

/// Status individual de cada trilha — permite o estado parcial:
/// loading, sucesso (com dados), falha (com mensagem) e cada trilha
/// evolui de forma independente.
enum TrailStatus { idle, loading, loaded, error }

class TrailState<T> extends Equatable {
  final TrailStatus status;
  final T? data;
  final String? error;

  const TrailState({this.status = TrailStatus.idle, this.data, this.error});

  TrailState<T> loading() =>
      TrailState(status: TrailStatus.loading, data: data);
  TrailState<T> success(T value) =>
      TrailState(status: TrailStatus.loaded, data: value);
  TrailState<T> failure(String message) =>
      TrailState(status: TrailStatus.error, data: data, error: message);

  bool get isLoading => status == TrailStatus.loading;
  bool get hasData => data != null;

  @override
  List<Object?> get props => [status, data, error];
}

class RecommendationState extends Equatable {
  final TrailState<RecommendedBook?> dice;
  final bool diceRolling;

  final TrailState<BecauseYouReadResult> becauseYouRead;
  final TrailState<FavoriteGenreNowResult> favoriteGenreNow;
  final TrailState<List<RecommendedBook>> trending;
  final TrailState<List<RecommendedBook>> catalogSurprise;
  final TrailState<List<RecommendedBook>> similarAuthors;
  final TrailState<List<RecommendedBook>> rereadWorthIt;

  const RecommendationState({
    this.dice = const TrailState(),
    this.diceRolling = false,
    this.becauseYouRead = const TrailState(),
    this.favoriteGenreNow = const TrailState(),
    this.trending = const TrailState(),
    this.catalogSurprise = const TrailState(),
    this.similarAuthors = const TrailState(),
    this.rereadWorthIt = const TrailState(),
  });

  RecommendationState copyWith({
    TrailState<RecommendedBook?>? dice,
    bool? diceRolling,
    TrailState<BecauseYouReadResult>? becauseYouRead,
    TrailState<FavoriteGenreNowResult>? favoriteGenreNow,
    TrailState<List<RecommendedBook>>? trending,
    TrailState<List<RecommendedBook>>? catalogSurprise,
    TrailState<List<RecommendedBook>>? similarAuthors,
    TrailState<List<RecommendedBook>>? rereadWorthIt,
  }) {
    return RecommendationState(
      dice: dice ?? this.dice,
      diceRolling: diceRolling ?? this.diceRolling,
      becauseYouRead: becauseYouRead ?? this.becauseYouRead,
      favoriteGenreNow: favoriteGenreNow ?? this.favoriteGenreNow,
      trending: trending ?? this.trending,
      catalogSurprise: catalogSurprise ?? this.catalogSurprise,
      similarAuthors: similarAuthors ?? this.similarAuthors,
      rereadWorthIt: rereadWorthIt ?? this.rereadWorthIt,
    );
  }

  @override
  List<Object?> get props => [
        dice,
        diceRolling,
        becauseYouRead,
        favoriteGenreNow,
        trending,
        catalogSurprise,
        similarAuthors,
        rereadWorthIt,
      ];
}
