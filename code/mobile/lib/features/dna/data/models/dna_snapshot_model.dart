import 'package:biblioo/features/dna/domain/dna_snapshot.dart';
import 'dna_theme_model.dart';

class DnaSnapshotModel {
  final bool isComputed;
  final int booksRead;
  final int booksRequired;
  final String? message;
  final String? dominantArchetypeLabel;
  final String? complexityLabel;
  final double? avgDaysPerBook;
  final double? rereadRate;
  final int? rereadCount;
  final int? abandonedCount;
  final List<String> secondaryArchetypes;
  final String? mostAbandonedGenre;
  final double? avgTimePerBookDays;
  final int? totalPagesRead;
  final Map<int, int> pagesByYear;
  final DateTime? calculatedAt;
  final List<DnaThemeModel> themes;

  const DnaSnapshotModel({
    required this.isComputed,
    required this.booksRead,
    required this.booksRequired,
    this.message,
    this.dominantArchetypeLabel,
    this.complexityLabel,
    this.avgDaysPerBook,
    this.rereadRate,
    this.rereadCount,
    this.abandonedCount,
    this.secondaryArchetypes = const [],
    this.mostAbandonedGenre,
    this.avgTimePerBookDays,
    this.totalPagesRead,
    this.pagesByYear = const {},
    this.calculatedAt,
    required this.themes,
  });

  factory DnaSnapshotModel.fromJson(Map<String, dynamic> json) {
    final parsedPagesByYear = _parsePagesByYear(json['pagesByYear']);
    final parsedCalculatedAt = _parseDate(json['calculatedAt']);

    if (json.containsKey('isComputed')) {
      return DnaSnapshotModel(
        isComputed: json['isComputed'] as bool? ?? false,
        booksRead: (json['booksRead'] as num?)?.toInt() ?? 0,
        booksRequired: (json['booksRequired'] as num?)?.toInt() ?? 5,
        message: json['message'] as String?,
        dominantArchetypeLabel: json['dominantArchetypeLabel'] as String?,
        complexityLabel: json['complexityLabel'] as String?,
        avgDaysPerBook: (json['avgDaysPerBook'] as num?)?.toDouble(),
        rereadRate: (json['rereadRate'] as num?)?.toDouble(),
        rereadCount: (json['rereadCount'] as num?)?.toInt(),
        abandonedCount: (json['abandonedCount'] as num?)?.toInt(),
        secondaryArchetypes: _parseStringList(json['secondaryArchetypes']),
        mostAbandonedGenre: json['mostAbandonedGenre'] as String?,
        avgTimePerBookDays: (json['avgTimePerBookDays'] as num?)?.toDouble(),
        totalPagesRead: (json['totalPagesRead'] as num?)?.toInt(),
        pagesByYear: parsedPagesByYear,
        calculatedAt: parsedCalculatedAt,
        themes: (json['themes'] as List<dynamic>? ?? [])
            .map((e) => DnaThemeModel.fromJson(e as Map<String, dynamic>))
            .toList(),
      );
    }

    final hasComputedShape =
        json.containsKey('centralThemes') || json.containsKey('status');

    if (hasComputedShape) {
      return DnaSnapshotModel(
        isComputed: (json['status'] as String?) == 'COMPUTED',
        booksRead: (json['booksReadCount'] as num?)?.toInt() ?? 0,
        booksRequired: 5,
        dominantArchetypeLabel: json['dominantArchetypeLabel'] as String?,
        complexityLabel: json['complexityLabel'] as String?,
        avgDaysPerBook: (json['avgDaysPerBook'] as num?)?.toDouble(),
        rereadRate: (json['rereadRate'] as num?)?.toDouble(),
        rereadCount: (json['rereadCount'] as num?)?.toInt(),
        abandonedCount: (json['abandonedCount'] as num?)?.toInt(),
        secondaryArchetypes: _parseStringList(json['secondaryArchetypes']),
        mostAbandonedGenre: json['mostAbandonedGenre'] as String?,
        avgTimePerBookDays: (json['avgTimePerBookDays'] as num?)?.toDouble(),
        totalPagesRead: (json['totalPagesRead'] as num?)?.toInt(),
        pagesByYear: parsedPagesByYear,
        calculatedAt: parsedCalculatedAt,
        themes: (json['centralThemes'] as List<dynamic>? ?? [])
            .map((e) => DnaThemeModel.fromJson(e as Map<String, dynamic>))
            .toList(),
        message: null,
      );
    }

    return DnaSnapshotModel(
      isComputed: false,
      booksRead: (json['booksRead'] as num?)?.toInt() ?? 0,
      booksRequired: (json['booksRequired'] as num?)?.toInt() ?? 5,
      message: json['message'] as String?,
      dominantArchetypeLabel: null,
      complexityLabel: null,
      avgDaysPerBook: null,
      rereadRate: null,
      rereadCount: null,
      abandonedCount: null,
      secondaryArchetypes: const [],
      mostAbandonedGenre: null,
      avgTimePerBookDays: null,
      totalPagesRead: null,
      pagesByYear: const {},
      calculatedAt: null,
      themes: const [],
    );
  }

  Map<String, dynamic> toJson() => {
    'isComputed': isComputed,
    'booksRead': booksRead,
    'booksRequired': booksRequired,
    'message': message,
    'dominantArchetypeLabel': dominantArchetypeLabel,
    'complexityLabel': complexityLabel,
    'avgDaysPerBook': avgDaysPerBook,
    'rereadRate': rereadRate,
    'rereadCount': rereadCount,
    'abandonedCount': abandonedCount,
    'secondaryArchetypes': secondaryArchetypes,
    'mostAbandonedGenre': mostAbandonedGenre,
    'avgTimePerBookDays': avgTimePerBookDays,
    'totalPagesRead': totalPagesRead,
    'pagesByYear': pagesByYear.map(
      (key, value) => MapEntry(key.toString(), value),
    ),
    'calculatedAt': calculatedAt?.toIso8601String(),
    'themes': themes.map((e) => e.toJson()).toList(),
  };

  DnaSnapshot toEntity() => DnaSnapshot(
    isComputed: isComputed,
    booksRead: booksRead,
    booksRequired: booksRequired,
    message: message,
    dominantArchetypeLabel: dominantArchetypeLabel,
    complexityLabel: complexityLabel,
    avgDaysPerBook: avgDaysPerBook,
    rereadRate: rereadRate,
    rereadCount: rereadCount,
    abandonedCount: abandonedCount,
    secondaryArchetypes: secondaryArchetypes,
    mostAbandonedGenre: mostAbandonedGenre,
    avgTimePerBookDays: avgTimePerBookDays,
    totalPagesRead: totalPagesRead,
    pagesByYear: pagesByYear,
    calculatedAt: calculatedAt,
    themes: themes.map((e) => e.toEntity()).toList(),
  );

  static Map<int, int> _parsePagesByYear(dynamic raw) {
    if (raw is! Map) return const {};
    final parsed = <int, int>{};
    for (final entry in raw.entries) {
      final key = int.tryParse(entry.key.toString());
      if (key == null) continue;
      final value = entry.value;
      if (value is num) {
        parsed[key] = value.toInt();
      }
    }
    return parsed;
  }

  static DateTime? _parseDate(dynamic raw) {
    if (raw is String && raw.isNotEmpty) return DateTime.tryParse(raw);
    return null;
  }

  static List<String> _parseStringList(dynamic raw) {
    if (raw is! List) return const [];
    return raw
        .map((item) => item?.toString() ?? '')
        .where((value) => value.isNotEmpty)
        .toList();
  }
}
