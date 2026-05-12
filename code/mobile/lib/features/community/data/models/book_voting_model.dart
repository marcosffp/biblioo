import 'package:biblioo/features/community/domain/book_voting.dart';
import 'book_voting_option_model.dart';

class BookVotingModel {
  final int id;
  final int communityId;
  final int createdBy;
  final String title;
  final String description;
  final String tieBreakRule;
  final List<BookVotingOptionModel> options;
  final String status;
  final DateTime createdAt;
  final DateTime? publishedAt;
  final DateTime? closedAt;
  final DateTime? approvedAt;
  final Map<String, dynamic>? approvedBook;
  final String? rejectionReason;
  final bool hasUserVoted;
  final int? userVoteOptionId;
  final int? winnerOptionId;

  BookVotingModel({
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

  factory BookVotingModel.fromJson(Map<String, dynamic> json) {
    final userVoteOptionId =
        (json['userVoteOptionId'] as int?) ?? (json['myVotedOptionId'] as int?);

    return BookVotingModel(
      id: json['id'] as int,
      communityId: json['communityId'] as int,
      createdBy: json['createdBy'] as int,
      title: json['title'] as String,
      description: (json['description'] as String?) ?? '',
      tieBreakRule: json['tieBreakRule'] as String? ?? 'ADMIN_CHOICE',
      options:
          (json['options'] as List<dynamic>?)
              ?.map(
                (o) => BookVotingOptionModel.fromJson(
                  o as Map<String, dynamic>,
                  votingId: json['id'] as int,
                ),
              )
              .toList() ??
          [],
      status: json['status'] as String? ?? 'PUBLISHED',
      createdAt: DateTime.parse(json['createdAt'] as String),
      publishedAt: json['publishedAt'] != null
          ? DateTime.parse(json['publishedAt'] as String)
          : null,
      closedAt: json['closedAt'] != null
          ? DateTime.parse(json['closedAt'] as String)
          : null,
      approvedAt: json['approvedAt'] != null
          ? DateTime.parse(json['approvedAt'] as String)
          : null,
      approvedBook: json['approvedBook'] as Map<String, dynamic>?,
      rejectionReason: json['rejectionReason'] as String?,
      hasUserVoted: json['hasUserVoted'] as bool? ?? userVoteOptionId != null,
      userVoteOptionId: userVoteOptionId,
      winnerOptionId: json['winnerOptionId'] as int?,
    );
  }

  TieBreakRule _parseTieBreakRule(String tieBreakRule) {
    final normalized = tieBreakRule.toUpperCase().replaceAll('_', '');
    return TieBreakRule.values.firstWhere(
      (e) => e.name.toUpperCase().replaceAll('_', '') == normalized,
      orElse: () => TieBreakRule.adminChoice,
    );
  }

  VotingStatus _parseStatus(String status) {
    return VotingStatus.values.firstWhere(
      (e) => e.name.toUpperCase() == status.toUpperCase(),
      orElse: () => VotingStatus.active,
    );
  }

  BookVoting toEntity() {
    return BookVoting(
      id: id,
      communityId: communityId,
      createdBy: createdBy,
      title: title,
      description: description,
      tieBreakRule: _parseTieBreakRule(tieBreakRule),
      options: options.map((o) => o.toEntity()).toList(),
      status: _parseStatus(status),
      createdAt: createdAt,
      publishedAt: publishedAt,
      closedAt: closedAt,
      approvedAt: approvedAt,
      approvedBook: null, // TODO: Convert approvedBook model
      rejectionReason: rejectionReason,
      hasUserVoted: hasUserVoted,
      userVoteOptionId: userVoteOptionId,
      winnerOptionId: winnerOptionId,
    );
  }
}
