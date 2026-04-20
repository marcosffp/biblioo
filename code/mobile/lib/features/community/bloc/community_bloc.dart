import 'package:flutter/foundation.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../data/community_repository.dart';
import 'community_event.dart';
import 'community_state.dart';

class CommunityBloc extends Bloc<CommunityEvent, CommunityState> {
  final CommunityRepository _repository;

  CommunityBloc(this._repository) : super(CommunityInitial()) {
    on<CommunityLoadRequested>(_onLoad);
    on<CommunityCreateRequested>(_onCreate);
    on<CommunityJoinRequested>(_onJoin);
    on<CommunityJoinByInviteRequested>(_onJoinByInvite);
    on<CommunityLeaveRequested>(_onLeave);
  }

  Future<void> _onLoad(
    CommunityLoadRequested event,
    Emitter<CommunityState> emit,
  ) async {
    emit(CommunityLoading());
    try {
      final result = await _repository.getCommunities(query: event.query);
      emit(
        CommunityLoaded(
          mine: result.mine,
          suggestions: result.suggestions,
          fromCache: result.fromCache,
          lastSyncedAt: result.lastSyncedAt,
        ),
      );
    } catch (e, st) {
      debugPrint('[CommunityBloc] ${event.runtimeType}: $e\n$st');
      emit(CommunityError('Erro ao carregar comunidades.'));
    }
  }

  Future<void> _onCreate(
    CommunityCreateRequested event,
    Emitter<CommunityState> emit,
  ) async {
    emit(CommunityMutating());
    try {
      await _repository.createCommunity(
        name: event.name,
        description: event.description,
        bookId: event.bookId,
        visibility: event.visibility,
        bookTitle: event.bookTitle,
        bookAuthor: event.bookAuthor,
        bookCoverUrl: event.bookCoverUrl,
      );
      emit(CommunityMutationSuccess('Comunidade criada com sucesso!'));
      add(CommunityLoadRequested());
    } catch (e, st) {
      debugPrint('[CommunityBloc] ${event.runtimeType}: $e\n$st');
      emit(CommunityError('Erro ao criar comunidade.'));
    }
  }

  Future<void> _onJoin(
    CommunityJoinRequested event,
    Emitter<CommunityState> emit,
  ) async {
    emit(CommunityMutating());
    try {
      await _repository.joinCommunity(event.communityId);
      emit(CommunityMutationSuccess('Você entrou na comunidade!'));
      add(CommunityLoadRequested());
    } catch (e, st) {
      debugPrint('[CommunityBloc] ${event.runtimeType}: $e\n$st');
      emit(CommunityError('Erro ao entrar na comunidade.'));
    }
  }

  Future<void> _onJoinByInvite(
    CommunityJoinByInviteRequested event,
    Emitter<CommunityState> emit,
  ) async {
    emit(CommunityMutating());
    try {
      await _repository.joinCommunityByInvite(event.inviteCode);
      emit(CommunityMutationSuccess('Você entrou na comunidade!'));
      add(CommunityLoadRequested());
    } catch (e, st) {
      debugPrint('[CommunityBloc] ${event.runtimeType}: $e\n$st');
      emit(CommunityError('Código de convite inválido.'));
    }
  }

  Future<void> _onLeave(
    CommunityLeaveRequested event,
    Emitter<CommunityState> emit,
  ) async {
    emit(CommunityMutating());
    try {
      await _repository.leaveCommunity(event.communityId);
      emit(CommunityMutationSuccess('Você saiu da comunidade.'));
      add(CommunityLoadRequested());
    } catch (e, st) {
      debugPrint('[CommunityBloc] ${event.runtimeType}: $e\n$st');
      emit(CommunityError('Erro ao sair da comunidade.'));
    }
  }
}
