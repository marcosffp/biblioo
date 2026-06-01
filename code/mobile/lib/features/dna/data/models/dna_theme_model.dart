import 'package:biblioo/features/dna/domain/dna_theme.dart';

class DnaThemeModel {
  final String theme;
  final double percentage;

  const DnaThemeModel({required this.theme, required this.percentage});

  factory DnaThemeModel.fromJson(Map<String, dynamic> json) => DnaThemeModel(
    theme: json['theme'] as String? ?? '',
    percentage: (json['percentage'] as num?)?.toDouble() ?? 0,
  );

  Map<String, dynamic> toJson() => {'theme': theme, 'percentage': percentage};

  DnaTheme toEntity() => DnaTheme(theme: theme, percentage: percentage);
}
