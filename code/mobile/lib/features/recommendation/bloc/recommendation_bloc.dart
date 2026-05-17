import 'dart:async';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../data/recommendation_repository.dart';
import 'recommendation_event.dart';
import 'recommendation_state.dart';

/// Bloc da feature recommendation. Carrega as 6 trilhas em paralelo
/// emitindo estado parcial conforme cada uma termina (UX igual à do front).
class RecommendationBloc
    extends Bloc<RecommendationEvent, RecommendationState> {
  final RecommendationRepository _repository;

  RecommendationBloc(this._repository) : super(const RecommendationState()) {
    on<RecommendationLoadRequested>(_onLoad);
    on<RecommendationDiceRolled>(_onRollDice);
    on<RecommendationTrailRefreshed>(_onRefreshTrail);
  }

  Future<void> _onLoad(
    RecommendationLoadRequested event,
    Emitter<RecommendationState> emit,
  ) async {
    emit(state.copyWith(
      dice: state.dice.loading(),
      becauseYouRead: state.becauseYouRead.loading(),
      favoriteGenreNow: state.favoriteGenreNow.loading(),
      trending: state.trending.loading(),
      catalogSurprise: state.catalogSurprise.loading(),
      similarAuthors: state.similarAuthors.loading(),
      rereadWorthIt: state.rereadWorthIt.loading(),
    ));

    // Dispara todas as trilhas em paralelo; cada uma emite quando termina.
    await Future.wait([
      _loadDice(emit),
      _loadBecauseYouRead(emit),
      _loadFavoriteGenreNow(emit),
      _loadTrending(emit),
      _loadCatalogSurprise(emit),
      _loadSimilarAuthors(emit),
      _loadRereadWorthIt(emit),
    ]);
  }

  Future<void> _onRollDice(
    RecommendationDiceRolled event,
    Emitter<RecommendationState> emit,
  ) async {
    emit(state.copyWith(diceRolling: true));
    try {
      final book = await _repository.rollDice();
      if (emit.isDone) return;
      emit(state.copyWith(dice: state.dice.success(book), diceRolling: false));
    } catch (_) {
      if (emit.isDone) return;
      emit(state.copyWith(
        dice: state.dice.failure('Não foi possível sortear um livro.'),
        diceRolling: false,
      ));
    }
  }

  Future<void> _onRefreshTrail(
    RecommendationTrailRefreshed event,
    Emitter<RecommendationState> emit,
  ) async {
    switch (event.trail) {
      case RecommendationTrail.becauseYouRead:
        emit(state.copyWith(becauseYouRead: state.becauseYouRead.loading()));
        await _loadBecauseYouRead(emit);
        break;
      case RecommendationTrail.favoriteGenreNow:
        emit(state.copyWith(favoriteGenreNow: state.favoriteGenreNow.loading()));
        await _loadFavoriteGenreNow(emit);
        break;
      case RecommendationTrail.trendingInCommunities:
        emit(state.copyWith(trending: state.trending.loading()));
        await _loadTrending(emit);
        break;
      case RecommendationTrail.catalogSurprise:
        emit(state.copyWith(catalogSurprise: state.catalogSurprise.loading()));
        await _loadCatalogSurprise(emit);
        break;
      case RecommendationTrail.similarAuthors:
        emit(state.copyWith(similarAuthors: state.similarAuthors.loading()));
        await _loadSimilarAuthors(emit);
        break;
      case RecommendationTrail.rereadWorthIt:
        emit(state.copyWith(rereadWorthIt: state.rereadWorthIt.loading()));
        await _loadRereadWorthIt(emit);
        break;
    }
  }

  // ── loaders ────────────────────────────────────────────────

  Future<void> _loadDice(Emitter<RecommendationState> emit) async {
    try {
      final book = await _repository.rollDice();
      if (emit.isDone) return;
      emit(state.copyWith(dice: state.dice.success(book)));
    } catch (_) {
      if (emit.isDone) return;
      emit(state.copyWith(
        dice: state.dice.failure('Não foi possível sortear um livro.'),
      ));
    }
  }

  Future<void> _loadBecauseYouRead(Emitter<RecommendationState> emit) async {
    try {
      final result = await _repository.getBecauseYouRead();
      if (emit.isDone) return;
      emit(state.copyWith(becauseYouRead: state.becauseYouRead.success(result)));
    } catch (_) {
      if (emit.isDone) return;
      emit(state.copyWith(
        becauseYouRead:
            state.becauseYouRead.failure('Falha ao carregar recomendações.'),
      ));
    }
  }

  Future<void> _loadFavoriteGenreNow(Emitter<RecommendationState> emit) async {
    try {
      final result = await _repository.getFavoriteGenreNow();
      if (emit.isDone) return;
      emit(state.copyWith(
        favoriteGenreNow: state.favoriteGenreNow.success(result),
      ));
    } catch (_) {
      if (emit.isDone) return;
      emit(state.copyWith(
        favoriteGenreNow:
            state.favoriteGenreNow.failure('Falha ao carregar recomendações.'),
      ));
    }
  }

  Future<void> _loadTrending(Emitter<RecommendationState> emit) async {
    try {
      final result = await _repository.getTrendingInCommunities();
      if (emit.isDone) return;
      emit(state.copyWith(trending: state.trending.success(result)));
    } catch (_) {
      if (emit.isDone) return;
      emit(state.copyWith(
        trending: state.trending.failure('Falha ao carregar recomendações.'),
      ));
    }
  }

  Future<void> _loadCatalogSurprise(Emitter<RecommendationState> emit) async {
    try {
      final result = await _repository.getCatalogSurprise();
      if (emit.isDone) return;
      emit(state.copyWith(
        catalogSurprise: state.catalogSurprise.success(result),
      ));
    } catch (_) {
      if (emit.isDone) return;
      emit(state.copyWith(
        catalogSurprise:
            state.catalogSurprise.failure('Falha ao carregar recomendações.'),
      ));
    }
  }

  Future<void> _loadSimilarAuthors(Emitter<RecommendationState> emit) async {
    try {
      final result = await _repository.getSimilarAuthors();
      if (emit.isDone) return;
      emit(state.copyWith(
        similarAuthors: state.similarAuthors.success(result),
      ));
    } catch (_) {
      if (emit.isDone) return;
      emit(state.copyWith(
        similarAuthors:
            state.similarAuthors.failure('Falha ao carregar recomendações.'),
      ));
    }
  }

  Future<void> _loadRereadWorthIt(Emitter<RecommendationState> emit) async {
    try {
      final result = await _repository.getRereadWorthIt();
      if (emit.isDone) return;
      emit(state.copyWith(
        rereadWorthIt: state.rereadWorthIt.success(result),
      ));
    } catch (_) {
      if (emit.isDone) return;
      emit(state.copyWith(
        rereadWorthIt:
            state.rereadWorthIt.failure('Falha ao carregar recomendações.'),
      ));
    }
  }
}
