import 'package:biblioo/features/preferences/domain/genre.dart';
import 'package:equatable/equatable.dart';

enum PreferencesStatus { idle, loadingGenres, genresLoaded, genresError, submitting, done, error }

class PreferencesState extends Equatable {
  final PreferencesStatus status;
  final List<Genre> genres;
  final String? errorMessage;

  const PreferencesState({
    this.status = PreferencesStatus.idle,
    this.genres = const [],
    this.errorMessage,
  });

  PreferencesState copyWith({
    PreferencesStatus? status,
    List<Genre>? genres,
    String? errorMessage,
  }) =>
      PreferencesState(
        status: status ?? this.status,
        genres: genres ?? this.genres,
        errorMessage: errorMessage ?? this.errorMessage,
      );

  @override
  List<Object?> get props => [status, genres, errorMessage];
}
