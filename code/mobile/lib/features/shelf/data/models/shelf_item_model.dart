import 'package:biblioo/features/shelf/domain/reading_status.dart';
import 'package:biblioo/features/shelf/domain/shelf_item.dart';

/// Model de serialização para ShelfItem.
/// Mapeia ShelfItemResponse, ShelfItemSummaryResponse e ShelfItemProgressResponse.
class ShelfItemModel {
  final int id;
  final int? shelfId;
  final int bookId;
  final String bookTitle;
  final String? bookCoverUrl;
  final ReadingStatus status;
  final int? currentPage;
  final int? totalPages;
  final int? progressPercent;

  const ShelfItemModel({
    required this.id,
    this.shelfId,
    required this.bookId,
    required this.bookTitle,
    this.bookCoverUrl,
    required this.status,
    this.currentPage,
    this.totalPages,
    this.progressPercent,
  });

  factory ShelfItemModel.fromJson(Map<String, dynamic> json) =>
      ShelfItemModel(
        id: (json['id'] as num).toInt(),
        shelfId: (json['shelfId'] as num?)?.toInt(),
        bookId: (json['bookId'] as num).toInt(),
        bookTitle: json['bookTitle'] as String,
        bookCoverUrl: json['bookCoverUrl'] as String?,
        status: ReadingStatus.fromJson(json['status'] as String?),
        currentPage: (json['currentPage'] as num?)?.toInt(),
        totalPages: (json['totalPages'] as num?)?.toInt(),
        progressPercent: (json['progressPercent'] as num?)?.toInt(),
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'shelfId': shelfId,
        'bookId': bookId,
        'bookTitle': bookTitle,
        'bookCoverUrl': bookCoverUrl,
        'status': status.toJson(),
        'currentPage': currentPage,
        'totalPages': totalPages,
        'progressPercent': progressPercent,
      };

  ShelfItem toEntity() => ShelfItem(
        id: id,
        shelfId: shelfId,
        bookId: bookId,
        bookTitle: bookTitle,
        bookCoverUrl: bookCoverUrl,
        status: status,
        currentPage: currentPage,
        totalPages: totalPages,
        progressPercent: progressPercent,
      );
}
