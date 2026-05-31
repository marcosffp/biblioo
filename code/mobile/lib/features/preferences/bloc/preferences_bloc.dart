import 'package:biblioo/features/preferences/data/preferences_repository.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'preferences_event.dart';
import 'preferences_state.dart';

class PreferencesBloc extends Bloc<PreferencesEvent, PreferencesState> {
  final PreferencesRepository _repository;

  PreferencesBloc(this._repository) : super(const PreferencesState()) {
    on<PreferencesGenresLoadRequested>(_onLoadGenres);
    on<PreferencesSubmitted>(_onSubmit);
    on<PreferencesSkipped>(_onSkip);
  }

  Future<void> _onLoadGenres(
    PreferencesGenresLoadRequested event,
    Emitter<PreferencesState> emit,
  ) async {
    emit(state.copyWith(status: PreferencesStatus.loadingGenres, errorMessage: null));
    try {
      final genres = await _repository.getGenres();
      emit(state.copyWith(
        status: PreferencesStatus.genresLoaded,
        genres: genres,
        errorMessage: null,
      ));
    } catch (_) {
      emit(state.copyWith(
        status: PreferencesStatus.genresError,
        errorMessage: 'Não foi possível carregar os gêneros.',
      ));
    }
  }

  Future<void> _onSubmit(
    PreferencesSubmitted event,
    Emitter<PreferencesState> emit,
  ) async {
    emit(state.copyWith(status: PreferencesStatus.submitting, errorMessage: null));
    try {
      await _repository.savePreferences(event.userId, event.selectedGenres);
      emit(state.copyWith(status: PreferencesStatus.done));
    } catch (_) {
      // 422 (preferências já existem) ou falha de rede — considera concluído localmente
      await _repository.skipOnboarding(event.userId);
      emit(state.copyWith(status: PreferencesStatus.done));
    }
  }

  Future<void> _onSkip(
    PreferencesSkipped event,
    Emitter<PreferencesState> emit,
  ) async {
    await _repository.skipOnboarding(event.userId);
    emit(state.copyWith(status: PreferencesStatus.done));
  }
}
