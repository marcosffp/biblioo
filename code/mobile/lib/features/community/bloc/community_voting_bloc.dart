import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:biblioo/features/community/data/community_voting_repository.dart';
import 'package:biblioo/features/community/domain/book_voting.dart';
import 'community_voting_event.dart';
import 'community_voting_state.dart';

class CommunityVotingBloc
    extends Bloc<CommunityVotingEvent, CommunityVotingState> {
  final CommunityVotingRepository repository;
  final int currentUserId;
  final int communityOwnerId;
  final String? currentUserRole;

  CommunityVotingBloc({
    required this.repository,
    required this.currentUserId,
    required this.communityOwnerId,
    required this.currentUserRole,
  }) : super(const CommunityVotingInitial()) {
    on<CommunityVotingCreateRequested>(_onCreateRequested);
    on<CommunityVotingPublishRequested>(_onPublishRequested);
    on<CommunityVotingLoadRequested>(_onLoadRequested);
    on<CommunityVotingRefreshRequested>(_onRefreshRequested);
    on<CommunityVotingCheckActiveRequested>(_onCheckActiveRequested);
    on<CommunityVotingCastVoteRequested>(_onCastVoteRequested);
    on<CommunityVotingUndoVoteRequested>(_onUndoVoteRequested);
    on<CommunityVotingCloseRequested>(_onCloseRequested);
    on<CommunityVotingApproveRequested>(_onApproveRequested);
    on<CommunityVotingRejectRequested>(_onRejectRequested);
  }

  bool get _canManageVoting {
    if (currentUserId == communityOwnerId) return true;

    final role = currentUserRole?.toUpperCase();
    return role == 'ADMIN' || role == 'LEADER' || role == 'OWNER';
  }

  Future<void> _onCreateRequested(
    CommunityVotingCreateRequested event,
    Emitter<CommunityVotingState> emit,
  ) async {
    try {
      emit(const CommunityVotingLoading());

      final payload = {
        'title': event.title,
        'tieBreakRule': event.tieBreakRule == TieBreakRule.adminChoice
            ? 'ADMIN_CHOICE'
            : 'RANDOM_DRAW',
        'startsAt': event.startsAt.toIso8601String(),
        'endsAt': event.endsAt.toIso8601String(),
        'options': event.bookIds.map((id) => {'bookId': id}).toList(),
      };

      final draft = await repository.createVoting(event.communityId, payload);

      emit(CommunityVotingCreateSuccess(draft));
      add(CommunityVotingLoadRequested(event.communityId));
    } on CommunityVotingFailure catch (e) {
      emit(CommunityVotingError(e.message));
    }
  }

  Future<void> _onPublishRequested(
    CommunityVotingPublishRequested event,
    Emitter<CommunityVotingState> emit,
  ) async {
    try {
      emit(const CommunityVotingLoading());
      final published = await repository.publishVoting(
        event.communityId,
        event.votingId,
      );
      emit(CommunityVotingPublishSuccess(published));
      add(CommunityVotingLoadRequested(event.communityId));
    } on CommunityVotingFailure catch (e) {
      emit(CommunityVotingError(e.message));
    }
  }

  Future<void> _onLoadRequested(
    CommunityVotingLoadRequested event,
    Emitter<CommunityVotingState> emit,
  ) async {
    emit(const CommunityVotingLoading());
    try {
      final votings = await repository.listVotings(event.communityId);

      if (votings.isEmpty) {
        emit(const CommunityVotingEmpty());
        return;
      }

      BookVoting? activeVoting;
      try {
        activeVoting = votings.firstWhere((v) => v.isActive);
      } catch (_) {
        activeVoting = null;
      }

      if (activeVoting != null) {
        emit(
          CommunityVotingLoadedWithActive(
            activeVoting: activeVoting,
            allVotings: votings,
            isOwner: _canManageVoting,
          ),
        );
      } else {
        emit(
          CommunityVotingLoadedNoActive(
            votings: votings,
            isOwner: _canManageVoting,
          ),
        );
      }
    } on CommunityVotingFailure catch (e) {
      emit(CommunityVotingError(e.message));
    }
  }

  Future<void> _onRefreshRequested(
    CommunityVotingRefreshRequested event,
    Emitter<CommunityVotingState> emit,
  ) async {
    try {
      final votings = await repository.listVotings(event.communityId);

      if (votings.isEmpty) {
        emit(const CommunityVotingEmpty());
        return;
      }

      BookVoting? activeVoting;
      try {
        activeVoting = votings.firstWhere((v) => v.isActive);
      } catch (_) {
        activeVoting = null;
      }

      if (activeVoting != null) {
        emit(
          CommunityVotingLoadedWithActive(
            activeVoting: activeVoting,
            allVotings: votings,
            isOwner: _canManageVoting,
          ),
        );
      } else {
        emit(
          CommunityVotingLoadedNoActive(
            votings: votings,
            isOwner: _canManageVoting,
          ),
        );
      }
    } on CommunityVotingFailure catch (e) {
      emit(CommunityVotingError(e.message));
    }
  }

  Future<void> _onCheckActiveRequested(
    CommunityVotingCheckActiveRequested event,
    Emitter<CommunityVotingState> emit,
  ) async {
    try {
      final activeVoting = await repository.getActiveVoting(event.communityId);

      if (activeVoting != null) {
        emit(CommunityVotingCheckedHasActive(activeVoting));
      } else {
        emit(const CommunityVotingCheckedNoActive());
      }
    } on CommunityVotingFailure catch (e) {
      emit(CommunityVotingError(e.message));
    }
  }

  Future<void> _onCastVoteRequested(
    CommunityVotingCastVoteRequested event,
    Emitter<CommunityVotingState> emit,
  ) async {
    try {
      final currentState = state;

      if (currentState is CommunityVotingLoadedWithActive &&
          currentState.activeVoting.userVoteOptionId == event.optionId) {
        final updated = await repository.undoVote(
          event.communityId,
          event.votingId,
          event.optionId,
        );

        emit(CommunityVotingVotingSuccess(updated));
        add(CommunityVotingLoadRequested(event.communityId));
        return;
      }

      if (currentState is CommunityVotingLoadedWithActive &&
          currentState.activeVoting.hasUserVoted &&
          currentState.activeVoting.userVoteOptionId != null) {
        await repository.undoVote(
          event.communityId,
          event.votingId,
          currentState.activeVoting.userVoteOptionId!,
        );
      }

      final updated = await repository.castVote(
        event.communityId,
        event.votingId,
        event.optionId,
      );

      emit(CommunityVotingVotingSuccess(updated));
      add(CommunityVotingLoadRequested(event.communityId));
    } on CommunityVotingFailure catch (e) {
      emit(CommunityVotingError(e.message));
    }
  }

  Future<void> _onUndoVoteRequested(
    CommunityVotingUndoVoteRequested event,
    Emitter<CommunityVotingState> emit,
  ) async {
    try {
      final currentState = state;
      if (currentState is! CommunityVotingLoadedWithActive ||
          currentState.activeVoting.userVoteOptionId == null) {
        return;
      }

      final updated = await repository.undoVote(
        event.communityId,
        event.votingId,
        currentState.activeVoting.userVoteOptionId!,
      );

      emit(CommunityVotingVotingSuccess(updated));
      add(CommunityVotingLoadRequested(event.communityId));
    } on CommunityVotingFailure catch (e) {
      emit(CommunityVotingError(e.message));
    }
  }

  Future<void> _onCloseRequested(
    CommunityVotingCloseRequested event,
    Emitter<CommunityVotingState> emit,
  ) async {
    final currentState = state;
    if (currentState is CommunityVotingLoadedWithActive) {
      try {
        emit(
          CommunityVotingActionInProgress(
            actionType: 'closing',
            voting: currentState.activeVoting,
          ),
        );

        final updated = await repository.closeVoting(
          event.communityId,
          event.votingId,
        );

        emit(
          CommunityVotingActionSuccess(actionType: 'closing', voting: updated),
        );
        add(CommunityVotingLoadRequested(event.communityId));
      } on CommunityVotingFailure catch (e) {
        emit(CommunityVotingError(e.message));
      }
    }
  }

  BookVoting? _findVotingInLoadedState(
    CommunityVotingState currentState,
    int votingId,
  ) {
    if (currentState is CommunityVotingLoadedWithActive) {
      if (currentState.activeVoting.id == votingId) {
        return currentState.activeVoting;
      }

      for (final voting in currentState.allVotings) {
        if (voting.id == votingId) {
          return voting;
        }
      }
    }

    if (currentState is CommunityVotingLoadedNoActive) {
      for (final voting in currentState.votings) {
        if (voting.id == votingId) {
          return voting;
        }
      }
    }

    return null;
  }

  Future<void> _onApproveRequested(
    CommunityVotingApproveRequested event,
    Emitter<CommunityVotingState> emit,
  ) async {
    final currentState = state;
    final targetVoting = _findVotingInLoadedState(currentState, event.votingId);
    if (targetVoting == null || !targetVoting.isClosed) {
      return;
    }

    try {
      emit(
        CommunityVotingActionInProgress(
          actionType: 'approving',
          voting: targetVoting,
        ),
      );

      final updated = await repository.approveVoting(
        event.communityId,
        event.votingId,
        winnerOptionId: event.winnerOptionId,
      );

      emit(
        CommunityVotingActionSuccess(actionType: 'approving', voting: updated),
      );
      add(CommunityVotingLoadRequested(event.communityId));
    } on CommunityVotingFailure catch (e) {
      emit(CommunityVotingError(e.message));
    }
  }

  Future<void> _onRejectRequested(
    CommunityVotingRejectRequested event,
    Emitter<CommunityVotingState> emit,
  ) async {
    final currentState = state;
    final targetVoting = _findVotingInLoadedState(currentState, event.votingId);
    if (targetVoting == null || !targetVoting.isClosed) {
      return;
    }

    try {
      emit(
        CommunityVotingActionInProgress(
          actionType: 'rejecting',
          voting: targetVoting,
        ),
      );

      final updated = await repository.rejectVoting(
        event.communityId,
        event.votingId,
        event.reason,
      );

      emit(
        CommunityVotingActionSuccess(actionType: 'rejecting', voting: updated),
      );
      add(CommunityVotingLoadRequested(event.communityId));
    } on CommunityVotingFailure catch (e) {
      emit(CommunityVotingError(e.message));
    }
  }
}
