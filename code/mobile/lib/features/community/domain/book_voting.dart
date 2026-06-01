import 'package:biblioo/features/book/domain/book.dart';
import 'book_voting_option.dart';

enum VotingStatus { draft, active, published, closed, approved, rejected }

enum TieBreakRule { adminChoice, randomDraw }

class BookVoting {
  final int id;
  final int communityId;
  final int createdBy;
  final String title;
  final String description;
  final TieBreakRule tieBreakRule;
  final List<BookVotingOption> options;
  final VotingStatus status;
  final DateTime createdAt;
  final DateTime? publishedAt;
  final DateTime? closedAt;
  final DateTime? approvedAt;
  final Book? approvedBook;
  final String? rejectionReason;
  final bool hasUserVoted;
  final int? userVoteOptionId;
  final int? winnerOptionId;

  const BookVoting({
    required this.id,
    required this.communityId,
    required this.createdBy,
    required this.title,
    required this.description,
    required this.tieBreakRule,
    required this.options,
    required this.status,
    required this.createdAt,
    this.publishedAt,
    this.closedAt,
    this.approvedAt,
    this.approvedBook,
    this.rejectionReason,
    required this.hasUserVoted,
    this.userVoteOptionId,
    this.winnerOptionId,
  });

  bool get isDraft => status == VotingStatus.draft;
  bool get isPublished =>
      status == VotingStatus.published || status == VotingStatus.active;
  bool get isClosed => status == VotingStatus.closed;
  bool get isApproved => status == VotingStatus.approved;
  bool get isRejected => status == VotingStatus.rejected;
  bool get isActive =>
      status == VotingStatus.active || status == VotingStatus.published;

  BookVotingOption? get winningOption {
    if (winnerOptionId == null) return null;
    for (final option in options) {
      if (option.id == winnerOptionId) {
        return option;
      }
    }
    return null;
  }

  int get totalVotes {
    return options.fold<int>(0, (sum, option) => sum + option.voteCount);
  }

  BookVoting copyWith({
    int? id,
    int? communityId,
    int? createdBy,
    String? title,
    String? description,
    TieBreakRule? tieBreakRule,
    List<BookVotingOption>? options,
    VotingStatus? status,
    DateTime? createdAt,
    DateTime? publishedAt,
    DateTime? closedAt,
    DateTime? approvedAt,
    Book? approvedBook,
    String? rejectionReason,
    bool? hasUserVoted,
    int? userVoteOptionId,
    int? winnerOptionId,
  }) {
    return BookVoting(
      id: id ?? this.id,
      communityId: communityId ?? this.communityId,
      createdBy: createdBy ?? this.createdBy,
      title: title ?? this.title,
      description: description ?? this.description,
      tieBreakRule: tieBreakRule ?? this.tieBreakRule,
      options: options ?? this.options,
      status: status ?? this.status,
      createdAt: createdAt ?? this.createdAt,
      publishedAt: publishedAt ?? this.publishedAt,
      closedAt: closedAt ?? this.closedAt,
      approvedAt: approvedAt ?? this.approvedAt,
      approvedBook: approvedBook ?? this.approvedBook,
      rejectionReason: rejectionReason ?? this.rejectionReason,
      hasUserVoted: hasUserVoted ?? this.hasUserVoted,
      userVoteOptionId: userVoteOptionId ?? this.userVoteOptionId,
      winnerOptionId: winnerOptionId ?? this.winnerOptionId,
    );
  }
}
