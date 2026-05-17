import 'package:biblioo/features/recommendation/domain/recommended_book.dart';

/// Model de serialização — espelha RecommendationResponse / DiceRollResponse.
class RecommendedBookModel {
  final int id;
  final String title;
  final String? description;
  final int? pageCount;
  final int? readerCount;
  final double? averageRating;
  final String? coverUrl;
  final double score;

  const RecommendedBookModel({
    required this.id,
    required this.title,
    this.description,
    this.pageCount,
    this.readerCount,
    this.averageRating,
    this.coverUrl,
    this.score = 0,
  });

  factory RecommendedBookModel.fromJson(Map<String, dynamic> json) =>
      RecommendedBookModel(
        id: (json['id'] as num).toInt(),
        title: json['title'] as String,
        description: json['description'] as String?,
        pageCount: (json['pageCount'] as num?)?.toInt(),
        readerCount: (json['readerCount'] as num?)?.toInt(),
        averageRating: (json['averageRating'] as num?)?.toDouble(),
        coverUrl: json['coverUrl'] as String?,
        score: (json['score'] as num?)?.toDouble() ?? 0,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'description': description,
        'pageCount': pageCount,
        'readerCount': readerCount,
        'averageRating': averageRating,
        'coverUrl': coverUrl,
        'score': score,
      };

  RecommendedBook toEntity() => RecommendedBook(
        id: id,
        title: title,
        description: description,
        pageCount: pageCount,
        readerCount: readerCount,
        averageRating: averageRating,
        coverUrl: coverUrl,
        score: score,
      );
}
