package com.biblioo.books.infrasestructure.external;

import com.biblioo.books.domain.model.Book;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

@Component
public class GoogleBooksSearchRanker {

  private static final int MAX_RESULTS = 15;

  public List<Book> merge(List<Book> primary, List<Book> secondary) {
    var seen =
        primary.stream().map(Book::getIsbn).filter(Objects::nonNull).collect(Collectors.toSet());

    var merged = new ArrayList<>(primary);
    secondary.stream()
        .filter(b -> b.getIsbn() == null || seen.add(b.getIsbn()))
        .forEach(merged::add);
    return merged;
  }

  public List<Book> rankByTitleRelevance(List<Book> books, String query) {
    String q = query.toLowerCase(Locale.ROOT).trim();
    String[] words = q.split("\\s+");

    return books.stream()
        .filter(b -> !isGenericOrLowQuality(b))
        .map(b -> Map.entry(b, titleScore(b.getTitle(), q, words)))
        // Sem filtro por score: livros do mesmo autor/série (ex: LotR para "hobbit")
        // ficam no final da lista mas não são descartados
        .sorted(Map.Entry.<Book, Integer>comparingByValue().reversed())
        .map(Map.Entry::getKey)
        .limit(MAX_RESULTS)
        .collect(java.util.stream.Collectors.toList());
  }

  private boolean isGenericOrLowQuality(Book b) {
    if (b == null || b.getTitle() == null) return true;

    String title = b.getTitle().toLowerCase(Locale.ROOT);

    if (isLikelyNotebookOrManual(title)) return true;
    if (isLikelyNoise(b)) return true;

    return false;
  }

  private boolean isLikelyNotebookOrManual(String title) {
    String[] genericPatterns = {
      "caderno", "notebook", "manual", "guia", "guide", "apostila", "artigo", "article"
    };

    for (String pattern : genericPatterns) {
      if (title.contains(pattern)) {
        return true;
      }
    }

    return false;
  }

  private boolean isLikelyNoise(Book b) {
    if ((b.getDescription() == null || b.getDescription().length() < 20)
        && b.getPageCount() != null
        && b.getPageCount() < 10) {
      return true;
    }

    return false;
  }

  private int titleScore(String title, String normalizedQuery, String[] words) {
    if (title == null) return 0;
    String t = title.toLowerCase(Locale.ROOT);

    if (t.equals(normalizedQuery)) return 100;
    if (t.startsWith(normalizedQuery)) return 90;
    if (t.contains(normalizedQuery)) return 80;

    long hits = Arrays.stream(words).filter(t::contains).count();
    if (hits == words.length) return 70;
    if (hits >= Math.ceil(words.length / 2.0)) return 40;
    if (hits > 0) return 10;
    return 0;
  }
}
