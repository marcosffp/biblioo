import 'dart:typed_data';

abstract class PostEvent {}

class PostCreateRequested extends PostEvent {
  final String text;
  final int? bookId;
  final List<String> tags;
  final bool hasSpoiler;
  final List<Uint8List> images;
  final List<String> imageNames;
  final Uint8List? gif;
  final String? gifName;

  PostCreateRequested({
    required this.text,
    this.bookId,
    this.tags = const [],
    this.hasSpoiler = false,
    this.images = const [],
    this.imageNames = const [],
    this.gif,
    this.gifName,
  });
}
