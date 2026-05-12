import 'package:biblioo/features/community/domain/book_voting.dart';

abstract class CommunityVotingState {
  const CommunityVotingState();
}

class CommunityVotingInitial extends CommunityVotingState {
  const CommunityVotingInitial();
}

class CommunityVotingLoading extends CommunityVotingState {
  const CommunityVotingLoading();
}

class CommunityVotingEmpty extends CommunityVotingState {
  const CommunityVotingEmpty();
}

class CommunityVotingLoadedWithActive extends CommunityVotingState {
  final BookVoting activeVoting;
  final List<BookVoting> allVotings;
  final bool isOwner;

  const CommunityVotingLoadedWithActive({
    required this.activeVoting,
    required this.allVotings,
    required this.isOwner,
  });
}

class CommunityVotingLoadedNoActive extends CommunityVotingState {
  final List<BookVoting> votings;
  final bool isOwner;

  const CommunityVotingLoadedNoActive({
    required this.votings,
    required this.isOwner,
  });
}

class CommunityVotingError extends CommunityVotingState {
  final String message;

  const CommunityVotingError(this.message);
}

class CommunityVotingVotingInProgress extends CommunityVotingState {
  final BookVoting currentVoting;

  const CommunityVotingVotingInProgress(this.currentVoting);
}

class CommunityVotingVotingSuccess extends CommunityVotingState {
  final BookVoting updatedVoting;

  const CommunityVotingVotingSuccess(this.updatedVoting);
}

class CommunityVotingActionInProgress extends CommunityVotingState {
  final String actionType; // 'closing', 'approving', 'rejecting'
  final BookVoting voting;

  const CommunityVotingActionInProgress({
    required this.actionType,
    required this.voting,
  });
}

class CommunityVotingActionSuccess extends CommunityVotingState {
  final String actionType;
  final BookVoting voting;

  const CommunityVotingActionSuccess({
    required this.actionType,
    required this.voting,
  });
}

class CommunityVotingCreateSuccess extends CommunityVotingState {
  final BookVoting voting;

  const CommunityVotingCreateSuccess(this.voting);
}

class CommunityVotingPublishSuccess extends CommunityVotingState {
  final BookVoting voting;

  const CommunityVotingPublishSuccess(this.voting);
}

class CommunityVotingCheckedNoActive extends CommunityVotingState {
  const CommunityVotingCheckedNoActive();
}

class CommunityVotingCheckedHasActive extends CommunityVotingState {
  final BookVoting activeVoting;

  const CommunityVotingCheckedHasActive(this.activeVoting);
}
