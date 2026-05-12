import 'package:biblioo/features/community/domain/book_voting.dart';

abstract class CommunityVotingEvent {}

class CommunityVotingCreateRequested extends CommunityVotingEvent {
  final int communityId;
  final String title;
  final TieBreakRule tieBreakRule;
  final DateTime startsAt;
  final DateTime endsAt;
  final List<int> bookIds;

  CommunityVotingCreateRequested({
    required this.communityId,
    required this.title,
    required this.tieBreakRule,
    required this.startsAt,
    required this.endsAt,
    required this.bookIds,
  });
}

class CommunityVotingPublishRequested extends CommunityVotingEvent {
  final int communityId;
  final int votingId;

  CommunityVotingPublishRequested({
    required this.communityId,
    required this.votingId,
  });
}

class CommunityVotingLoadRequested extends CommunityVotingEvent {
  final int communityId;
  CommunityVotingLoadRequested(this.communityId);
}

class CommunityVotingRefreshRequested extends CommunityVotingEvent {
  final int communityId;
  CommunityVotingRefreshRequested(this.communityId);
}

class CommunityVotingCheckActiveRequested extends CommunityVotingEvent {
  final int communityId;
  CommunityVotingCheckActiveRequested(this.communityId);
}

class CommunityVotingCastVoteRequested extends CommunityVotingEvent {
  final int communityId;
  final int votingId;
  final int optionId;
  CommunityVotingCastVoteRequested({
    required this.communityId,
    required this.votingId,
    required this.optionId,
  });
}

class CommunityVotingUndoVoteRequested extends CommunityVotingEvent {
  final int communityId;
  final int votingId;
  CommunityVotingUndoVoteRequested({
    required this.communityId,
    required this.votingId,
  });
}

class CommunityVotingCloseRequested extends CommunityVotingEvent {
  final int communityId;
  final int votingId;
  CommunityVotingCloseRequested({
    required this.communityId,
    required this.votingId,
  });
}

class CommunityVotingApproveRequested extends CommunityVotingEvent {
  final int communityId;
  final int votingId;
  final int? winnerOptionId;

  CommunityVotingApproveRequested({
    required this.communityId,
    required this.votingId,
    this.winnerOptionId,
  });
}

class CommunityVotingRejectRequested extends CommunityVotingEvent {
  final int communityId;
  final int votingId;
  final String reason;
  CommunityVotingRejectRequested({
    required this.communityId,
    required this.votingId,
    required this.reason,
  });
}
