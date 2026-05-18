import 'package:biblioo/features/recommendation/domain/because_you_read_result.dart';
import 'recommended_book_model.dart';

class BecauseYouReadModel {
  final String? seedBookTitle;
  final List<RecommendedBookModel> books;

  const BecauseYouReadModel({this.seedBookTitle, required this.books});

  factory BecauseYouReadModel.fromJson(Map<String, dynamic> json) =>
      BecauseYouReadModel(
        seedBookTitle: json['seedBookTitle'] as String?,
        books: (json['books'] as List<dynamic>? ?? [])
            .map((e) => RecommendedBookModel.fromJson(e as Map<String, dynamic>))
            .toList(),
      );

  Map<String, dynamic> toJson() => {
        'seedBookTitle': seedBookTitle,
        'books': books.map((b) => b.toJson()).toList(),
      };

  BecauseYouReadResult toEntity() => BecauseYouReadResult(
        seedBookTitle: seedBookTitle,
        books: books.map((m) => m.toEntity()).toList(),
      );
}
