package com.biblioo.share.domain.service;

import com.biblioo.books.domain.port.in.BookUseCase;
import com.biblioo.books.domain.port.in.ReadingHistoryUseCase;
import com.biblioo.books.domain.port.in.ReadingHistoryUseCase.BookReadingRecord;
import com.biblioo.dna.domain.model.LiteraryDna;
import com.biblioo.dna.domain.port.in.LiteraryDnaUseCase;
import com.biblioo.feed.domain.port.in.UserReviewsUseCase;
import com.biblioo.feed.domain.port.in.UserReviewsUseCase.ReviewRecord;
import com.biblioo.share.domain.model.ShareCardData;
import com.biblioo.share.domain.model.ShareCardData.DisplayBook;
import com.biblioo.user.domain.port.in.UserUseCase;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.awt.image.BufferedImage;
import java.net.URI;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import javax.imageio.ImageIO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ShareCardDataService {

  private final LiteraryDnaUseCase literaryDnaUseCase;
  private final UserUseCase userUseCase;
  private final ReadingHistoryUseCase readingHistoryUseCase;
  private final UserReviewsUseCase userReviewsUseCase;
  private final BookUseCase bookUseCase;
  private final ObjectMapper objectMapper;

  private record BookInfo(String title, String coverUrl) {}

  public ShareCardData buildCardData(Long userId) {
    var dna = literaryDnaUseCase.getDna(userId);
    var user = userUseCase.getById(userId);
    var allHistory = getAllReadingHistory(userId);
    var reviews = getUserReviews(userId);
    var selectedBooks = selectDisplayBooks(allHistory, reviews);
    var themes = getThemesForCard(dna, allHistory, reviews);
    int totalPages = computeTotalPages(userId, allHistory);

    try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
      var infoFutures =
          selectedBooks.stream()
              .map(
                  b ->
                      executor.<BookInfo>submit(
                          () -> {
                            try {
                              var book = bookUseCase.getById(b.bookId());
                              return new BookInfo(book.getTitle(), book.getCoverUrl());
                            } catch (Exception e) {
                              log.warn("Falha ao buscar livro bookId={}", b.bookId());
                              return new BookInfo(null, null);
                            }
                          }))
              .toList();

      List<BookInfo> bookInfos =
          infoFutures.stream()
              .map(
                  f -> {
                    try {
                      return f.get();
                    } catch (Exception e) {
                      return new BookInfo(null, null);
                    }
                  })
              .toList();

      int maxCovers = Math.min(3, selectedBooks.size());
      var coverFutures =
          IntStream.range(0, maxCovers)
              .mapToObj(
                  i ->
                      executor.<BufferedImage>submit(
                          () -> fetchCover(bookInfos.get(i).coverUrl())))
              .toList();

      List<BufferedImage> covers =
          coverFutures.stream()
              .map(
                  f -> {
                    try {
                      return f.get();
                    } catch (Exception e) {
                      return null;
                    }
                  })
              .filter(Objects::nonNull)
              .collect(Collectors.toList());

      List<DisplayBook> displayBooks =
          IntStream.range(0, bookInfos.size())
              .filter(
                  i -> {
                    String t = bookInfos.get(i).title();
                    return t != null && !t.isBlank();
                  })
              .mapToObj(
                  i -> new DisplayBook(selectedBooks.get(i).bookId(), bookInfos.get(i).title()))
              .collect(Collectors.toList());

      return new ShareCardData(user, dna, covers, displayBooks, themes, totalPages);
    } catch (Exception e) {
      throw new RuntimeException("Falha ao construir dados do share card userId=" + userId, e);
    }
  }

  private List<BookReadingRecord> getAllReadingHistory(Long userId) {
    try {
      var hist = readingHistoryUseCase.getReadingHistory(userId);
      var bestByBook = new LinkedHashMap<Long, BookReadingRecord>();
      for (var r : hist) {
        bestByBook.merge(
            r.bookId(),
            r,
            (existing, newR) -> {
              boolean newIsCompleted = "COMPLETED".equals(newR.status());
              boolean existingIsCompleted = "COMPLETED".equals(existing.status());
              if (newIsCompleted && !existingIsCompleted) return newR;
              if (!newIsCompleted && existingIsCompleted) return existing;
              if (newR.updatedAt() != null
                  && existing.updatedAt() != null
                  && newR.updatedAt().isAfter(existing.updatedAt())) return newR;
              return existing;
            });
      }
      return new ArrayList<>(bestByBook.values());
    } catch (Exception e) {
      log.warn("Falha ao buscar histórico do userId={}", userId);
      return List.of();
    }
  }

  private List<ReviewRecord> getUserReviews(Long userId) {
    try {
      return userReviewsUseCase.getReviewsByUserId(userId);
    } catch (Exception e) {
      log.warn("Falha ao buscar reviews do userId={}", userId);
      return List.of();
    }
  }


  private List<BookReadingRecord> selectDisplayBooks(
      List<BookReadingRecord> allHistory, List<ReviewRecord> reviews) {
    var historyByBook =
        allHistory.stream().collect(Collectors.toMap(BookReadingRecord::bookId, r -> r));
    var seenIds = new LinkedHashSet<Long>();
    var result = new ArrayList<BookReadingRecord>();

    reviews.stream()
        .filter(r -> r.bookId() != null && r.rating() != null)
        .sorted(
            Comparator.comparingInt(ReviewRecord::rating)
                .reversed()
                .thenComparing(
                    r -> r.updatedAt() != null ? r.updatedAt() : LocalDateTime.MIN,
                    Comparator.reverseOrder()))
        .forEach(
            r -> {
              if (result.size() >= 5) return;
              var record = historyByBook.get(r.bookId());
              if (record != null && seenIds.add(r.bookId())) result.add(record);
            });

    if (result.size() >= 5) return result;

    allHistory.stream()
        .filter(r -> "COMPLETED".equals(r.status()) && r.finishedAt() != null)
        .sorted(Comparator.comparing(BookReadingRecord::finishedAt).reversed())
        .filter(r -> seenIds.add(r.bookId()))
        .limit(5 - result.size())
        .forEach(result::add);

    if (result.size() >= 5) return result;

    allHistory.stream()
        .filter(r -> "COMPLETED".equals(r.status()) && r.finishedAt() == null)
        .filter(r -> seenIds.add(r.bookId()))
        .limit(5 - result.size())
        .forEach(result::add);

    if (result.size() >= 5) return result;

    allHistory.stream()
        .filter(r -> seenIds.add(r.bookId()))
        .limit(5 - result.size())
        .forEach(result::add);

    return result;
  }


  private List<Map<String, Object>> getThemesForCard(
      LiteraryDna dna, List<BookReadingRecord> allHistory, List<ReviewRecord> reviews) {
    List<Map<String, Object>> dnaThemes = parseThemes(dna.getCentralThemesJson());
    if (dnaThemes != null && !dnaThemes.isEmpty()) return dnaThemes;

    Map<Long, Integer> ratingByBook =
        reviews.stream()
            .filter(r -> r.bookId() != null && r.rating() != null)
            .collect(Collectors.toMap(ReviewRecord::bookId, ReviewRecord::rating, (a, b) -> a));

    Map<String, Long> genreCount = new LinkedHashMap<>();
    Map<String, Long> genreRatingSum = new LinkedHashMap<>();
    Map<String, Long> genreRatingCount = new LinkedHashMap<>();

    for (var r : allHistory) {
      if (r.categories() == null) continue;
      Integer rating = ratingByBook.get(r.bookId());
      for (String cat : r.categories()) {
        genreCount.merge(cat, 1L, Long::sum);
        if (rating != null) {
          genreRatingSum.merge(cat, (long) rating, Long::sum);
          genreRatingCount.merge(cat, 1L, Long::sum);
        }
      }
    }

    if (genreCount.isEmpty()) return List.of();

    return genreCount.entrySet().stream()
        .sorted(
            Map.Entry.<String, Long>comparingByValue()
                .reversed()
                .thenComparingDouble(
                    e -> {
                      long cnt = genreRatingCount.getOrDefault(e.getKey(), 0L);
                      return cnt == 0
                          ? 0.0
                          : -(double) genreRatingSum.getOrDefault(e.getKey(), 0L) / cnt;
                    }))
        .limit(5)
        .map(e -> Map.<String, Object>of("theme", e.getKey()))
        .collect(Collectors.toList());
  }

  private int computeTotalPages(Long userId, List<BookReadingRecord> allHistory) {
    int completedPages =
        allHistory.stream()
            .filter(r -> "COMPLETED".equals(r.status()) && r.pageCount() != null)
            .mapToInt(BookReadingRecord::pageCount)
            .sum();
    int currentReadingPages = 0;
    try {
      currentReadingPages = readingHistoryUseCase.getCurrentReadingPagesTotal(userId);
    } catch (Exception e) {
      log.warn("Falha ao buscar páginas em leitura do userId={}", userId);
    }
    return completedPages + currentReadingPages;
  }

  private BufferedImage fetchCover(String url) {
    if (url == null || url.isBlank()) return null;
    try {
      var con = URI.create(url).toURL().openConnection();
      con.setConnectTimeout(3_000);
      con.setReadTimeout(5_000);
      try (var in = con.getInputStream()) {
        return ImageIO.read(in);
      }
    } catch (Exception e) {
      log.warn("Falha ao baixar capa url={}", url);
      return null;
    }
  }

  private List<Map<String, Object>> parseThemes(String json) {
    if (json == null || json.isBlank()) return null;
    try {
      return objectMapper.readValue(json, new TypeReference<List<Map<String, Object>>>() {});
    } catch (Exception e) {
      try {
        List<String> list = objectMapper.readValue(json, new TypeReference<List<String>>() {});
        List<Map<String, Object>> fallback = new ArrayList<>();
        for (String item : list) fallback.add(Map.of("theme", item));
        return fallback;
      } catch (Exception ex) {
        log.warn("Falha ao parsear centralThemesJson: {}", json);
        return null;
      }
    }
  }
}
