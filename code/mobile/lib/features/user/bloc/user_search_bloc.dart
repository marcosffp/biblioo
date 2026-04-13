import 'dart:async';

import 'package:biblioo/features/user/data/user_repository.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'user_search_event.dart';
import 'user_search_state.dart';

class UserSearchBloc extends Bloc<UserSearchEvent, UserSearchState> {
  final UserRepository _repository;
  Timer? _debounce;

  UserSearchBloc(this._repository) : super(UserSearchInitial()) {
    on<UserSearchRequested>(_onSearch);
    on<UserSearchCleared>(_onClear);
  }

  Future<void> _onSearch(
    UserSearchRequested event,
    Emitter<UserSearchState> emit,
  ) async {
    final query = event.query.trim();
    if (query.length < 2) {
      emit(UserSearchInitial());
      return;
    }

    emit(UserSearchLoading());

    final completer = Completer<void>();
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 500), completer.complete);

    await completer.future;
    if (emit.isDone) return;

    try {
      final page = await _repository.searchUsers(query: query, size: 20);
      if (emit.isDone) return;

      if (page.users.isEmpty) {
        emit(UserSearchEmpty(query));
      } else {
        emit(UserSearchLoaded(page.users));
      }
    } catch (_) {
      if (emit.isDone) return;
      emit(UserSearchError('Erro ao buscar usuarios. Tente novamente.'));
    }
  }

  void _onClear(UserSearchCleared event, Emitter<UserSearchState> emit) {
    _debounce?.cancel();
    emit(UserSearchInitial());
  }

  @override
  Future<void> close() {
    _debounce?.cancel();
    return super.close();
  }
}
