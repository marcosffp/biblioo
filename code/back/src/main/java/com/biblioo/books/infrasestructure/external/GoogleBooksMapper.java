package com.biblioo.books.infrasestructure.external;

import com.biblioo.books.domain.model.Book;
import com.biblioo.books.infrasestructure.external.GoogleBooksModels.IndustryIdentifier;
import com.biblioo.books.infrasestructure.external.GoogleBooksModels.VolumeInfo;
import com.biblioo.books.infrasestructure.external.GoogleBooksModels.VolumeItem;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.time.temporal.ChronoField;
import java.util.List;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class GoogleBooksMapper {

  private static final DateTimeFormatter FLEXIBLE_DATE =
      new DateTimeFormatterBuilder()
          .appendPattern("yyyy")
          .optionalStart()
          .appendLiteral('-')
          .appendPattern("MM")
          .optionalEnd()
          .optionalStart()
          .appendLiteral('-')
          .appendPattern("dd")
          .optionalEnd()
          .parseDefaulting(ChronoField.MONTH_OF_YEAR, 1)
          .parseDefaulting(ChronoField.DAY_OF_MONTH, 1)
          .toFormatter();

  public Book toBook(VolumeItem item) {
    if (item == null || item.volumeInfo() == null) return null;

    VolumeInfo info = item.volumeInfo();
    if (info.title() == null || extractIsbn(info) == null) return null;

    return Book.builder()
        .isbn(extractIsbn(info))
        .title(info.title())
        .authors(info.authors() != null ? info.authors() : List.of())
        .publisher(info.publisher())
        .publishedAt(parseDate(info.publishedDate()))
        .description(info.description())
        .coverUrl(extractCoverUrl(info))
        .pageCount(info.pageCount())
        .averageRating(info.averageRating())
        .ratingCount(info.ratingsCount())
        .categories(List.of())
        .rawCategoryNames(info.categories() != null ? info.categories() : List.of())
        .build();
  }

  private String extractIsbn(VolumeInfo info) {
    if (info.industryIdentifiers() == null) return null;

    log.debug(
        info.industryIdentifiers().stream()
            .map(id -> id.type() + ":" + id.identifier())
            .collect(Collectors.joining(", ", "IDs encontrados: [", "]")));

    String isbn13 =
        info.industryIdentifiers().stream()
            .filter(id -> "ISBN_13".equals(id.type()))
            .map(IndustryIdentifier::identifier)
            .findFirst()
            .orElse(null);

    if (isbn13 != null) return isbn13;

    return info.industryIdentifiers().stream()
        .filter(id -> "ISBN_10".equals(id.type()))
        .map(IndustryIdentifier::identifier)
        .findFirst()
        .orElse(null);
  }

  private String extractCoverUrl(VolumeInfo info) {
    if (info.imageLinks() == null) return null;

    String url =
        info.imageLinks()
            .getOrDefault(
                "extraLarge",
                info.imageLinks()
                    .getOrDefault("large", info.imageLinks().getOrDefault("thumbnail", null)));

    return url != null ? url.replace("http://", "https://") : null;
  }

  private LocalDate parseDate(String raw) {
    if (raw == null || raw.isBlank()) return null;
    try {
      return LocalDate.parse(raw.trim(), FLEXIBLE_DATE);
    } catch (Exception e) {
      return null;
    }
  }
}
