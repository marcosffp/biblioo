class BookVotingOption {
  final int id;
  final int votingId;
  final int bookId;
  final String bookTitle;
  final String? bookCoverUrl;
  final int voteCount;
  final double percentage;

  const BookVotingOption({
    required this.id,
    required this.votingId,
    required this.bookId,
    required this.bookTitle,
    this.bookCoverUrl,
    required this.voteCount,
    required this.percentage,
  });

  BookVotingOption copyWith({
    int? id,
    int? votingId,
    int? bookId,
    String? bookTitle,
    String? bookCoverUrl,
    int? voteCount,
    double? percentage,
  }) {
    return BookVotingOption(
      id: id ?? this.id,
      votingId: votingId ?? this.votingId,
      bookId: bookId ?? this.bookId,
      bookTitle: bookTitle ?? this.bookTitle,
      bookCoverUrl: bookCoverUrl ?? this.bookCoverUrl,
      voteCount: voteCount ?? this.voteCount,
      percentage: percentage ?? this.percentage,
    );
  }
}
