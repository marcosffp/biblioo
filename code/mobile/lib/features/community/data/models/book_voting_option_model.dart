import 'package:biblioo/features/community/domain/book_voting_option.dart';

class BookVotingOptionModel {
  final int id;
  final int votingId;
  final int bookId;
  final String bookTitle;
  final String? bookCoverUrl;
  final int voteCount;
  final double percentage;

  BookVotingOptionModel({
    required this.id,
    required this.votingId,
    required this.bookId,
    required this.bookTitle,
    this.bookCoverUrl,
    required this.voteCount,
    required this.percentage,
  });

  factory BookVotingOptionModel.fromJson(
    Map<String, dynamic> json, {
    required int votingId,
  }) {
    return BookVotingOptionModel(
      id: json['id'] as int,
      votingId: votingId,
      bookId: json['bookId'] as int,
      bookTitle: json['bookTitle'] as String? ?? 'Livro #${json['bookId']}',
      bookCoverUrl: json['bookCoverUrl'] as String?,
      voteCount: json['voteCount'] as int? ?? 0,
      percentage: (json['percentage'] as num?)?.toDouble() ?? 0.0,
    );
  }

  BookVotingOption toEntity() {
    return BookVotingOption(
      id: id,
      votingId: votingId,
      bookId: bookId,
      bookTitle: bookTitle,
      bookCoverUrl: bookCoverUrl,
      voteCount: voteCount,
      percentage: percentage,
    );
  }
}
