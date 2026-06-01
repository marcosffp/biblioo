import 'recommended_book.dart';

class FavoriteGenreNowResult {
  final List<String> topGenres;
  final List<RecommendedBook> books;

  const FavoriteGenreNowResult({required this.topGenres, required this.books});
}
