import 'feed_item_model.dart';

class FeedPageModel {
  final List<FeedItemModel> items;
  final String? nextCursor;
  final bool hasMore;

  const FeedPageModel({
    required this.items,
    this.nextCursor,
    required this.hasMore,
  });

  factory FeedPageModel.fromJson(Map<String, dynamic> json) {
    final rawItems = json['items'];
    return FeedPageModel(
      items: rawItems is List
          ? rawItems
                .map(
                  (item) =>
                      FeedItemModel.fromJson(item as Map<String, dynamic>),
                )
                .toList()
          : const [],
      nextCursor: json['nextCursor'] as String?,
      hasMore: (json['hasMore'] as bool?) ?? false,
    );
  }
}
