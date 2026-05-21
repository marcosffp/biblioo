import 'package:biblioo/features/preferences/domain/genre.dart';

class GenreModel {
  final String original;
  final String translated;

  const GenreModel({required this.original, required this.translated});

  factory GenreModel.fromJson(Map<String, dynamic> json) => GenreModel(
        original: json['original'] as String,
        translated: json['translated'] as String,
      );

  Genre toEntity() => Genre(original: original, translated: translated);
}
