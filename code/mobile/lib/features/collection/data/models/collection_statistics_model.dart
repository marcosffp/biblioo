import 'package:biblioo/features/collection/domain/collection_statistics.dart';

class CollectionStatisticsModel {
  final int collectionId;
  final int totalBooks;
  final int booksCompleted;
  final int booksReading;
  final int booksRereading;
  final int booksWantToRead;
  final int booksAbandoned;
  final int totalPages;
  final int pagesRead;

  const CollectionStatisticsModel({
    required this.collectionId,
    required this.totalBooks,
    required this.booksCompleted,
    required this.booksReading,
    required this.booksRereading,
    required this.booksWantToRead,
    required this.booksAbandoned,
    required this.totalPages,
    required this.pagesRead,
  });

  factory CollectionStatisticsModel.fromJson(Map<String, dynamic> json) =>
      CollectionStatisticsModel(
        collectionId: (json['collectionId'] as num).toInt(),
        totalBooks: (json['totalBooks'] as num).toInt(),
        booksCompleted: (json['booksCompleted'] as num).toInt(),
        booksReading: (json['booksReading'] as num).toInt(),
        booksRereading: (json['booksRereading'] as num).toInt(),
        booksWantToRead: (json['booksWantToRead'] as num).toInt(),
        booksAbandoned: (json['booksAbandoned'] as num).toInt(),
        totalPages: (json['totalPages'] as num).toInt(),
        pagesRead: (json['pagesRead'] as num).toInt(),
      );

  CollectionStatistics toEntity() => CollectionStatistics(
        collectionId: collectionId,
        totalBooks: totalBooks,
        booksCompleted: booksCompleted,
        booksReading: booksReading,
        booksRereading: booksRereading,
        booksWantToRead: booksWantToRead,
        booksAbandoned: booksAbandoned,
        totalPages: totalPages,
        pagesRead: pagesRead,
      );
}
