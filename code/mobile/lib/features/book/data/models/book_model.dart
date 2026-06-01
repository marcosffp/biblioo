import 'package:biblioo/features/book/domain/book.dart';

/// Model de serialização — fromJson (API) / toJson (cache) / toEntity.
class BookModel {
  final int id;
  final String title;
  final List<String> authors;
  final String? coverUrl;
  final int? pageCount;
  final double? averageRating;
  final String? description;
  final int? readerCount;

  const BookModel({
    required this.id,
    required this.title,
    required this.authors,
    this.coverUrl,
    this.pageCount,
    this.averageRating,
    this.description,
    this.readerCount,
  });

  factory BookModel.fromJson(Map<String, dynamic> json) => BookModel(
    id: (json['id'] as num).toInt(),
    title: json['title'] as String,
    authors:
        (json['authors'] as List<dynamic>?)?.map((e) => e as String).toList() ??
        [],
    coverUrl: json['coverUrl'] as String?,
    pageCount: (json['pageCount'] as num?)?.toInt(),
    averageRating: (json['averageRating'] as num?)?.toDouble(),
    description: json['description'] as String?,
    readerCount: (json['readerCount'] as num?)?.toInt(),
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'title': title,
    'authors': authors,
    'coverUrl': coverUrl,
    'pageCount': pageCount,
    'averageRating': averageRating,
    'description': description,
    'readerCount': readerCount,
  };

  Book toEntity() => Book(
    id: id,
    title: title,
    authors: authors,
    coverUrl: coverUrl,
    pageCount: pageCount,
    averageRating: averageRating,
    description: description,
    readerCount: readerCount,
  );
}
