import 'package:biblioo/features/preferences/domain/genre.dart';
import 'package:equatable/equatable.dart';

enum PreferencesStatus { idle, loadingGenres, genresLoaded, genresError, submitting, done, error }

const _unset = Object();

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
    Object? errorMessage = _unset,
  }) =>
      PreferencesState(
        status: status ?? this.status,
        genres: genres ?? this.genres,
        errorMessage: identical(errorMessage, _unset)
            ? this.errorMessage
            : errorMessage as String?,
      );

  @override
  List<Object?> get props => [status, genres, errorMessage];
}
