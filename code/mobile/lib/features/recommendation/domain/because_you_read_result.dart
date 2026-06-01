import 'recommended_book.dart';

class BecauseYouReadResult {
  final String? seedBookTitle;
  final List<RecommendedBook> books;

  const BecauseYouReadResult({this.seedBookTitle, required this.books});
}
