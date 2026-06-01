package com.biblioo.dna.domain.service;

import com.biblioo.books.domain.port.in.ReadingHistoryUseCase.BookReadingRecord;
import com.biblioo.dna.domain.model.LiteraryArchetype;
import com.biblioo.dna.infrastructure.dto.ThemeEntryDto;
import com.biblioo.feed.domain.port.in.UserReviewsUseCase.ReviewRecord;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class DnaCalculationService {

  public static final int MIN_BOOKS_REQUIRED = 5;
  public static final int MONTHS_FOR_RECENCY = 1;

  /**
   * Maps raw Google Books category strings to a controlled Portuguese vocabulary.
   * Order matters: specific entries (e.g. "romance") must precede broad catch-alls
   * (e.g. "fiction") to prevent mis-classification.
   */
  private static final Map<String, String> CATEGORY_NORMALIZATION = new LinkedHashMap<>();

  static {
    // Romance — must appear before the generic "fiction" catch-all
    CATEGORY_NORMALIZATION.put("romance",              "Romance");
    CATEGORY_NORMALIZATION.put("love stor",            "Romance");
    CATEGORY_NORMALIZATION.put("erotic",               "Romance");
    CATEGORY_NORMALIZATION.put("chick lit",            "Romance");
    // Fantasy / Sci-Fi
    CATEGORY_NORMALIZATION.put("fantasy",              "Fantasia");
    CATEGORY_NORMALIZATION.put("science fiction",      "Ficção Científica");
    CATEGORY_NORMALIZATION.put("sci-fi",               "Ficção Científica");
    CATEGORY_NORMALIZATION.put("dystop",               "Distopia");
    CATEGORY_NORMALIZATION.put("paranormal",           "Paranormal");
    CATEGORY_NORMALIZATION.put("supernatural",         "Paranormal");
    CATEGORY_NORMALIZATION.put("urban fantasy",        "Paranormal");
    // Thriller / Mystery
    CATEGORY_NORMALIZATION.put("mystery",              "Mistério");
    CATEGORY_NORMALIZATION.put("detective",            "Mistério");
    CATEGORY_NORMALIZATION.put("crime",                "Mistério");
    CATEGORY_NORMALIZATION.put("thriller",             "Suspense");
    CATEGORY_NORMALIZATION.put("suspense",             "Suspense");
    CATEGORY_NORMALIZATION.put("horror",               "Terror");
    // Other fiction
    CATEGORY_NORMALIZATION.put("historical",           "Ficção Histórica");
    CATEGORY_NORMALIZATION.put("adventure",            "Aventura");
    CATEGORY_NORMALIZATION.put("young adult",          "Young Adult");
    CATEGORY_NORMALIZATION.put("ya fiction",           "Young Adult");
    CATEGORY_NORMALIZATION.put("juvenile",             "Infantil");
    CATEGORY_NORMALIZATION.put("children",             "Infantil");
    CATEGORY_NORMALIZATION.put("literary fiction",     "Literatura");
    CATEGORY_NORMALIZATION.put("literature",           "Literatura");
    CATEGORY_NORMALIZATION.put("contemporary",         "Ficção Contemporânea");
    // Non-fiction
    CATEGORY_NORMALIZATION.put("biography",            "Biografia");
    CATEGORY_NORMALIZATION.put("autobiography",        "Biografia");
    CATEGORY_NORMALIZATION.put("memoir",               "Biografia");
    CATEGORY_NORMALIZATION.put("self-help",            "Autoajuda");
    CATEGORY_NORMALIZATION.put("self help",            "Autoajuda");
    CATEGORY_NORMALIZATION.put("personal development", "Autoajuda");
    CATEGORY_NORMALIZATION.put("psychology",           "Psicologia");
    CATEGORY_NORMALIZATION.put("philosophy",           "Filosofia");
    CATEGORY_NORMALIZATION.put("business",             "Negócios");
    CATEGORY_NORMALIZATION.put("economics",            "Negócios");
    CATEGORY_NORMALIZATION.put("finance",              "Negócios");
    CATEGORY_NORMALIZATION.put("comic",                "Quadrinhos");
    CATEGORY_NORMALIZATION.put("graphic novel",        "Quadrinhos");
    CATEGORY_NORMALIZATION.put("manga",                "Quadrinhos");
    CATEGORY_NORMALIZATION.put("poetry",               "Poesia");
    CATEGORY_NORMALIZATION.put("poem",                 "Poesia");
    CATEGORY_NORMALIZATION.put("science",              "Ciência");
    CATEGORY_NORMALIZATION.put("history",              "História");
    CATEGORY_NORMALIZATION.put("social science",       "Ciências Sociais");
    // Broad catch-alls last
    CATEGORY_NORMALIZATION.put("nonfiction",           "Não-Ficção");
    CATEGORY_NORMALIZATION.put("non-fiction",          "Não-Ficção");
    CATEGORY_NORMALIZATION.put("non fiction",          "Não-Ficção");
    CATEGORY_NORMALIZATION.put("fiction",              "Ficção");
  }

  private static String normalizeCategory(String raw) {
    if (raw == null || raw.isBlank()) return null;
    String lower = raw.toLowerCase(Locale.ROOT);
    for (Map.Entry<String, String> entry : CATEGORY_NORMALIZATION.entrySet()) {
      if (lower.contains(entry.getKey())) return entry.getValue();
    }
    return raw;
  }

public record DnaResult(
    int booksReadCount,
    int abandonedCount,
    double complexityScore,
    String complexityLabel,
    Double avgDaysPerBook,
    double rereadRate,
    int rereadCount,
    List<ThemeEntryDto> centralThemes,
    LiteraryArchetype dominantArchetype,
    List<LiteraryArchetype> secondaryArchetypes,
    String mostAbandonedGenre,
    Double avgTimePerBookDays,
    int totalPagesRead,
    Map<Integer, Integer> pagesByYear
) {}

  public boolean hasSufficientData(List<BookReadingRecord> history) {
    long completedCount = history.stream().filter(r -> "COMPLETED".equals(r.status())).count();
    return completedCount >= MIN_BOOKS_REQUIRED;
  }

  public int countCompletedBooks(List<BookReadingRecord> history) {
    return (int) history.stream().filter(r -> "COMPLETED".equals(r.status())).count();
  }

  private int calculateTotalPages(List<BookReadingRecord> completed) {
    return completed.stream()
        .filter(r -> r.pageCount() != null)
        .mapToInt(BookReadingRecord::pageCount)
        .sum();
  }

  private Map<Integer, Integer> calculatePagesByYear(List<BookReadingRecord> completed) {
    return completed.stream()
        .filter(r -> r.finishedAt() != null && r.pageCount() != null)
        .collect(Collectors.groupingBy(
            r -> r.finishedAt().getYear(),
            TreeMap::new,
            Collectors.summingInt(BookReadingRecord::pageCount)
        ));
  }

  public DnaResult calculate(List<BookReadingRecord> history, List<ReviewRecord> reviews) {
    List<BookReadingRecord> completed =
        history.stream().filter(r -> "COMPLETED".equals(r.status())).toList();
    List<BookReadingRecord> abandoned =
        history.stream().filter(r -> "ABANDONED".equals(r.status())).toList();

    Map<Long, Integer> ratingByBook =
        reviews.stream()
            .filter(r -> r.rating() != null)
            .collect(Collectors.toMap(ReviewRecord::bookId, ReviewRecord::rating, (a, b) -> a));

    double complexityScore = calculateComplexity(completed);
    String complexityLabel = complexityLabel(complexityScore);
    Double avgDaysPerBook = calculateAvgDaysPerBook(completed);
    int totalRereads = completed.stream().mapToInt(r -> r.rereadCount()).sum();
    double rereadRate =
        completed.isEmpty()
            ? 0.0
            : Math.round(totalRereads * 100.0 / completed.size()) / 100.0;
    List<ThemeEntryDto> centralThemes = calculateCentralThemes(completed, ratingByBook);
    String mostAbandonedGenre = calculateMostAbandonedGenre(abandoned);
    Double avgTimePerBookDays = calculateAvgTimePerBook(completed);

    LiteraryArchetype dominantArchetype =
        determineArchetype(complexityScore, avgDaysPerBook, rereadRate, centralThemes, completed.size());
    List<LiteraryArchetype> secondaryArchetypes =
        determineSecondaryArchetypes(
            dominantArchetype, complexityScore, avgDaysPerBook, rereadRate,
            centralThemes, completed.size());
    int totalPagesRead = calculateTotalPages(completed);
    Map<Integer, Integer> pagesByYear = calculatePagesByYear(completed);
    return new DnaResult(
        completed.size(),
        abandoned.size(),
        complexityScore,
        complexityLabel,
        avgDaysPerBook,
        rereadRate,
        totalRereads,
        centralThemes,
        dominantArchetype,
        secondaryArchetypes,
        mostAbandonedGenre,
        avgTimePerBookDays,
        totalPagesRead,
        pagesByYear);
  }

  private double calculateComplexity(List<BookReadingRecord> completed) {
    LocalDate sixMonthsAgo = LocalDate.now().minusMonths(MONTHS_FOR_RECENCY);
    double weightedSum = 0;
    double totalWeight = 0;

    for (var record : completed) {
      if (record.complexityScore() == null) continue;
      LocalDate finished = record.finishedAt();
      double weight = (finished != null && !finished.isBefore(sixMonthsAgo)) ? 1.5 : 1.0;
      weightedSum += record.complexityScore() * weight;
      totalWeight += weight;
    }
    return totalWeight == 0 ? 0 : Math.round(weightedSum / totalWeight * 10.0) / 10.0;
  }

  private String complexityLabel(double score) {
    if (score <= 25) return "leitura leve";
    if (score <= 50) return "popular";
    if (score <= 75) return "literário moderado";
    return "denso/experimental";
  }

  private Double calculateAvgDaysPerBook(List<BookReadingRecord> completed) {
    List<Long> days =
        completed.stream()
            .filter(r -> r.startedAt() != null && r.finishedAt() != null)
            .map(r -> ChronoUnit.DAYS.between(r.startedAt(), r.finishedAt()))
            .filter(d -> d >= 0)
            .toList();

    if (days.isEmpty()) return null;
    return Math.round(days.stream().mapToLong(Long::longValue).average().orElse(0) * 100.0) / 100.0;
  }

  private List<ThemeEntryDto> calculateCentralThemes(
      List<BookReadingRecord> completed, Map<Long, Integer> ratingByBook) {
    Map<String, Long> themeCount = new LinkedHashMap<>();
    Map<String, Integer> themeMaxRating = new LinkedHashMap<>();
    int total = completed.size();

    for (var record : completed) {
      if (record.categories() == null) continue;
      for (String category : record.categories()) {
        String normalized = normalizeCategory(category);
        if (normalized == null) continue;
        themeCount.merge(normalized, 1L, Long::sum);
        Integer rating = ratingByBook.get(record.bookId());
        if (rating != null) {
          themeMaxRating.merge(normalized, rating, Integer::max);
        }
      }
    }

    return themeCount.entrySet().stream()
        .filter(e -> e.getValue() >= 2)
        .sorted(
            Map.Entry.<String, Long>comparingByValue()
                .reversed()
                .thenComparingInt(e -> -themeMaxRating.getOrDefault(e.getKey(), 0)))
        .limit(7)
        .map(e -> new ThemeEntryDto(e.getKey(), Math.round(e.getValue() * 1000.0 / total) / 10.0))
        .toList();
  }

  private String calculateMostAbandonedGenre(List<BookReadingRecord> abandoned) {
    if (abandoned.size() < 3) return null;
    return abandoned.stream()
        .flatMap(r -> (r.categories() != null ? r.categories() : List.<String>of()).stream())
        .collect(Collectors.groupingBy(g -> g, Collectors.counting()))
        .entrySet()
        .stream()
        .max(Map.Entry.comparingByValue())
        .map(Map.Entry::getKey)
        .orElse(null);
  }

  private Double calculateAvgTimePerBook(List<BookReadingRecord> completed) {
    List<Long> days =
        completed.stream()
            .filter(r -> r.startedAt() != null && r.finishedAt() != null)
            .map(r -> ChronoUnit.DAYS.between(r.startedAt(), r.finishedAt()))
            .filter(d -> d >= 0)
            .toList();
    if (days.size() < 3) return null;
    return Math.round(days.stream().mapToLong(Long::longValue).average().orElse(0) * 100.0) / 100.0;
  }

  LiteraryArchetype determineArchetype(
      double complexityScore,
      Double avgDays,
      double rereadRate,
      List<ThemeEntryDto> themes,
      int totalBooks) {

    if (rereadRate >= 0.3) return LiteraryArchetype.RE_READER;

    if (!themes.isEmpty()) {
      double topThemePct = themes.get(0).percentage();
      if (topThemePct > 50) return LiteraryArchetype.GENRE_DEVOTEE;
      if (topThemePct < 20 && themes.size() >= 5) return LiteraryArchetype.ECLECTIC_READER;
    }

    if (complexityScore > 70) return LiteraryArchetype.CLASSICS_SCHOLAR;

    if (avgDays != null && avgDays < 5 && totalBooks >= 10)
      return LiteraryArchetype.COMPULSIVE_READER;

    return LiteraryArchetype.DISCOVERY_READER;
  }

  private List<LiteraryArchetype> determineSecondaryArchetypes(
      LiteraryArchetype dominant,
      double complexityScore,
      Double avgDays,
      double rereadRate,
      List<ThemeEntryDto> themes,
      int totalBooks) {

    List<LiteraryArchetype> candidates = new ArrayList<>();

    if (dominant != LiteraryArchetype.RE_READER && rereadRate >= 0.15)
      candidates.add(LiteraryArchetype.RE_READER);
    if (dominant != LiteraryArchetype.CLASSICS_SCHOLAR && complexityScore > 60)
      candidates.add(LiteraryArchetype.CLASSICS_SCHOLAR);
    if (dominant != LiteraryArchetype.COMPULSIVE_READER
        && avgDays != null && avgDays < 7 && totalBooks >= 5)
      candidates.add(LiteraryArchetype.COMPULSIVE_READER);
    if (dominant != LiteraryArchetype.GENRE_DEVOTEE
        && !themes.isEmpty()
        && themes.get(0).percentage() > 35)
      candidates.add(LiteraryArchetype.GENRE_DEVOTEE);

    return candidates.stream().limit(2).toList();
  }
}