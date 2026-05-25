import 'dna_theme.dart';

class DnaSnapshot {
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
  final List<DnaTheme> themes;

  const DnaSnapshot({
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
}
