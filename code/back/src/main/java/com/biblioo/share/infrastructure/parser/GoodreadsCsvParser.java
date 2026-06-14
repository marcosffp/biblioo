package com.biblioo.share.infrastructure.parser;

import com.biblioo.share.domain.model.GoodreadsImportError;
import com.biblioo.share.domain.model.GoodreadsImportRow;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PushbackInputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVRecord;
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class GoodreadsCsvParser {

  public record ParsedCsv(List<GoodreadsImportRow> rows, List<GoodreadsImportError> errors) {}

  private static final int MAX_ROWS = 10_000;
  private static final int MAX_FIELD_LENGTH = 50_000;

  private static final Pattern ISBN_PATTERN = Pattern.compile("=?\"?([0-9X]*)\"?");
  private static final Pattern ISBN10_PATTERN = Pattern.compile("^[0-9]{9}[0-9X]$");
  private static final Pattern ISBN13_PATTERN = Pattern.compile("^97[89][0-9]{10}$");
  private static final DateTimeFormatter GR_DATE_FMT =
      DateTimeFormatter.ofPattern("yyyy/MM/dd");

  private static final Set<String> VALID_EXCLUSIVE_SHELVES =
      Set.of("read", "currently-reading", "to-read");

  private static final String COL_BOOK_ID = "Book Id";
  private static final String COL_TITLE = "Title";
  private static final String COL_AUTHOR = "Author";
  private static final String COL_AUTHOR_LF = "Author l-f";
  private static final String COL_ADDITIONAL_AUTHORS = "Additional Authors";
  private static final String COL_ISBN = "ISBN";
  private static final String COL_ISBN13 = "ISBN13";
  private static final String COL_MY_RATING = "My Rating";
  private static final String COL_PUBLISHER = "Publisher";
  private static final String COL_BINDING = "Binding";
  private static final String COL_NUMBER_OF_PAGES = "Number of Pages";
  private static final String COL_YEAR_PUBLISHED = "Year Published";
  private static final String COL_ORIGINAL_PUB_YEAR = "Original Publication Year";
  private static final String COL_DATE_READ = "Date Read";
  private static final String COL_DATE_ADDED = "Date Added";
  private static final String COL_BOOKSHELVES = "Bookshelves";
  private static final String COL_EXCLUSIVE_SHELF = "Exclusive Shelf";
  private static final String COL_MY_REVIEW = "My Review";
  private static final String COL_SPOILER = "Spoiler";
  private static final String COL_PRIVATE_NOTES = "Private Notes";
  private static final String COL_READ_COUNT = "Read Count";
  private static final String COL_OWNED_COPIES = "Owned Copies";

  public ParsedCsv parse(InputStream rawIn) throws IOException {
    var rows = new ArrayList<GoodreadsImportRow>();
    var errors = new ArrayList<GoodreadsImportError>();

    try (var bomStripped = stripBom(rawIn);
        var reader = new InputStreamReader(bomStripped, StandardCharsets.UTF_8);
        var parser =
            CSVFormat.RFC4180
                .builder()
                .setHeader()
                .setSkipHeaderRecord(true)
                .setIgnoreSurroundingSpaces(true)
                .setNullString("")
                .build()
                .parse(reader)) {

      int rowNum = 2;
      for (CSVRecord record : parser) {
        if (rowNum - 1 > MAX_ROWS) {
          errors.add(
              new GoodreadsImportError(
                  rowNum, "", "Limite de " + MAX_ROWS + " linhas excedido. Importação encerrada."));
          break;
        }
        try {
          rows.add(parseRow(record, rowNum));
        } catch (Exception e) {
          String title = safeGet(record, COL_TITLE);
          errors.add(new GoodreadsImportError(rowNum, title, e.getMessage()));
        }
        rowNum++;
      }
    }
    return new ParsedCsv(rows, errors);
  }

  private GoodreadsImportRow parseRow(CSVRecord record, int rowNum) {
    validateRecordSize(record, rowNum);

    long bookId = parseLongRequired(record, COL_BOOK_ID, rowNum);
    String title =
        stripCsvInjection(
            requireNonBlank(safeGet(record, COL_TITLE), "Title é obrigatório"));
    String author =
        stripCsvInjection(
            normalizeAuthor(requireNonBlank(safeGet(record, COL_AUTHOR), "Author é obrigatório")));
    String authorLf = stripCsvInjection(nullIfBlank(safeGet(record, COL_AUTHOR_LF)));
    List<String> additionalAuthors =
        parseList(safeGet(record, COL_ADDITIONAL_AUTHORS)).stream()
            .map(this::stripCsvInjection)
            .toList();
    String isbn = parseIsbn(safeGet(record, COL_ISBN));
    String isbn13 = parseIsbn(safeGet(record, COL_ISBN13));

    int myRating = parseIntBounded(safeGet(record, COL_MY_RATING), 0, 0, 5);
    String publisher = stripCsvInjection(nullIfBlank(safeGet(record, COL_PUBLISHER)));
    String binding = stripCsvInjection(nullIfBlank(safeGet(record, COL_BINDING)));
    Integer pages = parsePages(safeGet(record, COL_NUMBER_OF_PAGES));
    Integer yearPublished = parseIntNullable(safeGet(record, COL_YEAR_PUBLISHED));
    Integer originalPubYear = parseIntNullable(safeGet(record, COL_ORIGINAL_PUB_YEAR));
    LocalDate dateRead = parseDate(safeGet(record, COL_DATE_READ));
    LocalDate dateAdded = parseDate(safeGet(record, COL_DATE_ADDED));
    List<String> bookshelves = parseList(safeGet(record, COL_BOOKSHELVES));

    String exclusiveShelf = safeGet(record, COL_EXCLUSIVE_SHELF);
    if (!VALID_EXCLUSIVE_SHELVES.contains(exclusiveShelf)) {
      throw new IllegalArgumentException(
          "Exclusive Shelf inválido: '"
              + exclusiveShelf
              + "'. Valores aceitos: read, currently-reading, to-read");
    }

    String myReview = sanitizeReview(safeGet(record, COL_MY_REVIEW));
    boolean spoiler = parseBool(safeGet(record, COL_SPOILER));
    String privateNotes = nullIfBlank(safeGet(record, COL_PRIVATE_NOTES));
    int readCount = parseIntBounded(safeGet(record, COL_READ_COUNT), 0, 0, Integer.MAX_VALUE);
    int ownedCopies = parseIntBounded(safeGet(record, COL_OWNED_COPIES), 0, 0, Integer.MAX_VALUE);

    return new GoodreadsImportRow(
        bookId,
        title,
        author,
        authorLf,
        additionalAuthors,
        isbn,
        isbn13,
        myRating,
        publisher,
        binding,
        pages,
        yearPublished,
        originalPubYear,
        dateRead,
        dateAdded,
        bookshelves,
        exclusiveShelf,
        myReview,
        spoiler,
        privateNotes,
        readCount,
        ownedCopies);
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  private void validateRecordSize(CSVRecord record, int rowNum) {
    for (String col :
        List.of(COL_TITLE, COL_MY_REVIEW, COL_PRIVATE_NOTES, COL_AUTHOR)) {
      String val = safeGet(record, col);
      if (val != null && val.length() > MAX_FIELD_LENGTH) {
        throw new IllegalArgumentException(
            "Campo '"
                + col
                + "' excede o tamanho máximo de "
                + MAX_FIELD_LENGTH
                + " caracteres");
      }
    }
  }

  private String safeGet(CSVRecord record, String column) {
    try {
      return record.get(column);
    } catch (IllegalArgumentException e) {
      return null;
    }
  }

  // Strips UTF-8 BOM (EF BB BF) if present
  private InputStream stripBom(InputStream in) throws IOException {
    var pb = new PushbackInputStream(in, 3);
    byte[] bom = new byte[3];
    int read = pb.read(bom, 0, 3);
    if (read == 3 && bom[0] == (byte) 0xEF && bom[1] == (byte) 0xBB && bom[2] == (byte) 0xBF) {
      return pb;
    }
    if (read > 0) pb.unread(bom, 0, read);
    return pb;
  }

  // Goodreads exports ISBN as ="0452284236" or ="" (Excel wrapper)
  String parseIsbn(String raw) {
    if (raw == null || raw.isBlank()) return null;
    Matcher m = ISBN_PATTERN.matcher(raw.strip());
    if (!m.matches()) return null;
    String value = m.group(1);
    return (value == null || value.isBlank()) ? null : value;
  }



  // Converts YYYY/MM/DD to LocalDate; empty or malformed -> null
  LocalDate parseDate(String raw) {
    if (raw == null || raw.isBlank()) return null;
    try {
      return LocalDate.parse(raw.strip(), GR_DATE_FMT);
    } catch (DateTimeParseException e) {
      log.warn("Data malformada '{}' — tratada como nula", raw);
      return null;
    }
  }

  // Collapses double spaces in author name (known Goodreads bug)
  String normalizeAuthor(String raw) {
    if (raw == null) return null;
    return raw.strip().replaceAll(" +", " ");
  }

  // Splits "a, b, c" into ["a", "b", "c"], empty string -> empty list
  List<String> parseList(String raw) {
    if (raw == null || raw.isBlank()) return List.of();
    var result = new ArrayList<String>();
    for (String part : raw.split(",")) {
      String trimmed = part.strip();
      if (!trimmed.isEmpty()) result.add(trimmed);
    }
    return List.copyOf(result);
  }

  // Pages=0 is treated as unknown -> null in our domain
  private Integer parsePages(String raw) {
    if (raw == null || raw.isBlank()) return null;
    try {
      int val = Integer.parseInt(raw.strip());
      return val <= 0 ? null : val;
    } catch (NumberFormatException e) {
      return null;
    }
  }

  private Integer parseIntNullable(String raw) {
    if (raw == null || raw.isBlank()) return null;
    try {
      return Integer.parseInt(raw.strip());
    } catch (NumberFormatException e) {
      return null;
    }
  }

  private int parseIntBounded(String raw, int defaultValue, int min, int max) {
    if (raw == null || raw.isBlank()) return defaultValue;
    try {
      int val = Integer.parseInt(raw.strip());
      return Math.max(min, Math.min(max, val));
    } catch (NumberFormatException e) {
      return defaultValue;
    }
  }

  private long parseLongRequired(CSVRecord record, String col, int rowNum) {
    String raw = safeGet(record, col);
    if (raw == null || raw.isBlank()) {
      throw new IllegalArgumentException("Campo '" + col + "' é obrigatório");
    }
    try {
      return Long.parseLong(raw.strip());
    } catch (NumberFormatException e) {
      throw new IllegalArgumentException("Campo '" + col + "' deve ser um número: " + raw);
    }
  }

  // Empty string -> false; "true" (case-insensitive) -> true
  boolean parseBool(String raw) {
    return "true".equalsIgnoreCase(raw == null ? "" : raw.strip());
  }

  private String nullIfBlank(String s) {
    return (s == null || s.isBlank()) ? null : s.strip();
  }

  private String requireNonBlank(String s, String message) {
    if (s == null || s.isBlank()) throw new IllegalArgumentException(message);
    return s.strip();
  }

  // Sanitizes HTML from My Review: keeps only safe inline tags
  private String sanitizeReview(String raw) {
    if (raw == null || raw.isBlank()) return null;
    String cleaned = Jsoup.clean(raw, Safelist.basic());
    return cleaned.isBlank() ? null : cleaned;
  }

  // CSV Injection: strips leading formula-injection characters (=, +, -, @, TAB, CR)
  // from any free-text field before it reaches the domain model.
  // This prevents payloads like `=cmd|'/c calc'!A0` from being stored and later
  // re-exported into a spreadsheet that would execute them.
  String stripCsvInjection(String value) {
    if (value == null) return null;
    String stripped = value.stripLeading();
    while (!stripped.isEmpty() && "=+-@\t\r".indexOf(stripped.charAt(0)) >= 0) {
      stripped = stripped.substring(1).stripLeading();
    }
    return stripped;
  }
}
