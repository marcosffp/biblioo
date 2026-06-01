import 'package:biblioo/features/recommendation/domain/favorite_genre_now_result.dart';
import 'recommended_book_model.dart';

class FavoriteGenreNowModel {
  final List<String> topGenres;
  final List<RecommendedBookModel> books;

  const FavoriteGenreNowModel({required this.topGenres, required this.books});

  factory FavoriteGenreNowModel.fromJson(Map<String, dynamic> json) =>
      FavoriteGenreNowModel(
        topGenres: (json['topGenres'] as List<dynamic>? ?? [])
            .map((e) => e as String)
            .toList(),
        books: (json['books'] as List<dynamic>? ?? [])
            .map((e) => RecommendedBookModel.fromJson(e as Map<String, dynamic>))
            .toList(),
      );

  Map<String, dynamic> toJson() => {
        'topGenres': topGenres,
        'books': books.map((b) => b.toJson()).toList(),
      };

  FavoriteGenreNowResult toEntity() => FavoriteGenreNowResult(
        topGenres: topGenres,
        books: books.map((m) => m.toEntity()).toList(),
      );
}
