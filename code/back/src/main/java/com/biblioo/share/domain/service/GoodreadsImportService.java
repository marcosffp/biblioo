package com.biblioo.share.domain.service;

import com.biblioo.books.domain.exception.ShelfBusinessException;
import com.biblioo.books.domain.model.Book;
import com.biblioo.books.domain.model.ReadingStatus;
import com.biblioo.books.domain.model.Shelf;
import com.biblioo.books.domain.port.in.BookUseCase;
import com.biblioo.books.domain.port.in.ShelfUseCase;
import com.biblioo.books.domain.service.BookEnrichService;
import com.biblioo.feed.domain.exception.ReviewBusinessException;
import com.biblioo.feed.domain.port.in.ReviewUseCase;
import com.biblioo.share.domain.exception.GoodreadsImportException;
import com.biblioo.share.domain.model.GoodreadsImportError;
import com.biblioo.share.domain.model.GoodreadsImportResult;
import com.biblioo.share.domain.model.GoodreadsImportRow;
import com.biblioo.share.domain.port.in.GoodreadsImportUseCase;
import com.biblioo.share.infrastructure.io.BoundedInputStream;
import com.biblioo.share.infrastructure.parser.GoodreadsCsvParser;
import com.biblioo.share.infrastructure.parser.GoodreadsCsvParser.ParsedCsv;
import com.biblioo.share.infrastructure.ratelimit.ImportRateLimiter;
import java.io.BufferedInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class GoodreadsImportService implements GoodreadsImportUseCase {

  private static final String IMPORT_SHELF_NAME = "Importação Goodreads";
  private static final String IMPORT_SHELF_DESC = "Livros importados do Goodreads";
  private static final long MAX_BYTES = 10L * 1024 * 1024;
  private static final int MAX_FILENAME_LENGTH = 255;
  private static final int TIKA_SNIFF_BYTES = 8192;

  private static final Set<String> ALLOWED_MEDIA_TYPES =
      Set.of("text/plain", "text/csv", "application/csv", "application/vnd.ms-excel");

  // Static: avoids RestartClassLoader conflict with Tika's ServiceLoader during DevTools restart
  private static final Tika TIKA = new Tika();

  private final GoodreadsCsvParser csvParser;
  private final BookUseCase bookUseCase;
  private final ShelfUseCase shelfUseCase;
  private final BookEnrichService bookEnrichService;
  private final ReviewUseCase reviewUseCase;
  private final ImportRateLimiter rateLimiter;

  @Override
  public GoodreadsImportResult importCsv(
      Long userId, InputStream csvStream, String originalFilename) {

    validateFilename(originalFilename);
    rateLimiter.checkAndConsume(userId);

    ParsedCsv parsed;
    try {
      var buffered = new BufferedInputStream(csvStream);
      buffered.mark(TIKA_SNIFF_BYTES + 1);
      byte[] sniff = buffered.readNBytes(TIKA_SNIFF_BYTES);
      buffered.reset();
      validateContentType(sniff, originalFilename);

      var bounded = new BoundedInputStream(buffered, MAX_BYTES + 1);
      parsed = csvParser.parse(bounded);

      if (bounded.overflowed()) {
        throw new GoodreadsImportException(
            "Arquivo excede o tamanho máximo de 10MB após leitura.");
      }
    } catch (GoodreadsImportException e) {
      throw e;
    } catch (IOException e) {
      throw new GoodreadsImportException("Erro ao ler o arquivo CSV: " + e.getMessage());
    }

    var errors = new ArrayList<>(parsed.errors());
    int imported = 0;
    int skipped = 0;
    int reviewsImported = 0;

    Shelf shelf = findOrCreateImportShelf(userId);

    log.info(
        "Importação Goodreads iniciada: userId={}, totalRows={}",
        userId,
        parsed.rows().size());

    for (GoodreadsImportRow row : parsed.rows()) {
      RowOutcome outcome = processRow(userId, shelf.getId(), row, errors);
      if (outcome.shelfResult() == ShelfResult.IMPORTED) imported++;
      else if (outcome.shelfResult() == ShelfResult.SKIPPED) skipped++;
      if (outcome.reviewCreated()) reviewsImported++;
    }

    int failed = errors.size() - parsed.errors().size();
    int totalRows = parsed.rows().size() + parsed.errors().size();

    log.info(
        "Importação concluída: userId={}, total={}, imported={}, skipped={}, failed={}, reviews={}",
        userId,
        totalRows,
        imported,
        skipped,
        failed,
        reviewsImported);

    return new GoodreadsImportResult(
        totalRows, imported, skipped, failed, reviewsImported, List.copyOf(errors));
  }

  private RowOutcome processRow(
      Long userId, Long shelfId, GoodreadsImportRow row, List<GoodreadsImportError> errors) {
    try {
      Optional<Book> book = resolveBook(row);
      if (book.isEmpty()) {
        errors.add(
            new GoodreadsImportError(
                0,
                row.title(),
                "Livro não encontrado no catálogo"
                    + ". Tente buscá-lo manualmente."));
        return RowOutcome.failed();
      }

      Long bookId = book.get().getId();
      ReadingStatus status = mapStatus(row.exclusiveShelf());

      // Step 1: Add to shelf
      ShelfResult shelfResult = addToShelf(userId, shelfId, bookId, status, row, errors);
      if (shelfResult == ShelfResult.FAILED) {
        return RowOutcome.failed();
      }

      // Step 2: Import review/rating — attempted regardless of whether the book
      // was newly added or already existed in the shelf (supports reimports).
      boolean reviewCreated = tryImportReview(userId, bookId, row);

      return new RowOutcome(shelfResult, reviewCreated);

    } catch (Exception e) {
      log.warn("Erro inesperado ao processar '{}': {}", row.title(), e.getMessage());
      errors.add(new GoodreadsImportError(0, row.title(), "Erro inesperado: " + e.getMessage()));
      return RowOutcome.failed();
    }
  }

  private ShelfResult addToShelf(
      Long userId,
      Long shelfId,
      Long bookId,
      ReadingStatus status,
      GoodreadsImportRow row,
      List<GoodreadsImportError> errors) {
    try {
      shelfUseCase.addShelfItem(userId, shelfId, bookId, status);
      return ShelfResult.IMPORTED;
    } catch (ShelfBusinessException e) {
      if (e.getMessage() != null && e.getMessage().contains("já está nesta estante")) {
        return ShelfResult.SKIPPED;
      }
      errors.add(new GoodreadsImportError(0, row.title(), e.getMessage()));
      return ShelfResult.FAILED;
    }
  }

  /**
   * Creates a review if the CSV row has a rating (>0) or review text. Returns true if a new review
   * was created, false if skipped (no data, or review already exists).
   */
  private boolean tryImportReview(Long userId, Long bookId, GoodreadsImportRow row) {
    boolean hasRating = row.myRating() > 0;
    boolean hasText = row.myReview() != null && !row.myReview().isBlank();

    if (!hasRating && !hasText) {
      return false;
    }

    Integer rating = hasRating ? row.myRating() : null;
    String text = hasText ? row.myReview() : null;

    try {
      reviewUseCase.createReview(userId, bookId, rating, text);
      return true;
    } catch (ReviewBusinessException e) {
      // "já fez uma review" is expected on reimports — log at debug, not warn
      if (e.getMessage() != null && e.getMessage().contains("já fez uma review")) {
        log.debug("Review já existe para userId={}, bookId={}", userId, bookId);
      } else {
        log.warn(
            "Falha ao criar review para userId={}, bookId={}: {}", userId, bookId, e.getMessage());
      }
      return false;
    } catch (Exception e) {
      log.warn(
          "Erro inesperado ao criar review para userId={}, bookId={}: {}",
          userId,
          bookId,
          e.getMessage());
      return false;
    }
  }

  private Optional<Book> resolveBook(GoodreadsImportRow row) {
    // 1. DB lookup — ISBN-13 preferred (Google Books Mapper stores ISBN-13 as primary)
    if (row.isbn13() != null) {
      Optional<Book> found = bookUseCase.findByIsbn(row.isbn13());
      if (found.isPresent()) return found;
    }
    // 2. DB lookup — ISBN-10 fallback
    if (row.isbn() != null) {
      Optional<Book> found = bookUseCase.findByIsbn(row.isbn());
      if (found.isPresent()) return found;
    }

    // 3. External API — precise ISBN search (isbn: prefix forces exact match in Google Books)
    if (row.isbn13() != null || row.isbn() != null) {
      String isbnQuery =
          row.isbn13() != null ? "isbn:" + row.isbn13() : "isbn:" + row.isbn();
      try {
        List<Book> enriched = bookEnrichService.enrichSync(isbnQuery);
        Optional<Book> matched = enriched.stream().filter(b -> isbnMatches(b, row)).findFirst();
        if (matched.isPresent()) return matched;
        log.info(
            "ISBN '{}' não confirmado nos resultados ({} livros) — tentando título+autor: '{}'",
            isbnQuery, enriched.size(), row.title());
      } catch (Exception e) {
        log.warn("Busca por ISBN falhou para '{}': {}", row.title(), e.getMessage());
      }
    }

    // 4. Fallback: título + autor — sempre tentado quando as etapas anteriores falham,
    //    inclusive para livros que têm ISBN (edição diferente, ISBN do Goodreads ≠ nossa base).
    String titleAuthorQuery = row.title() + " " + row.author();
    try {
      List<Book> enriched = bookEnrichService.enrichSync(titleAuthorQuery);
      Optional<Book> matched =
          enriched.stream().filter(b -> titleMatches(b, row.title())).findFirst();
      if (matched.isPresent()) return matched;
      log.info(
          "Título+autor não retornou match para '{}' ({} resultado(s))",
          row.title(), enriched.size());
    } catch (Exception e) {
      log.warn("Busca por título+autor falhou para '{}': {}", row.title(), e.getMessage());
    }

    return Optional.empty();
  }

  private boolean isbnMatches(Book book, GoodreadsImportRow row) {
    if (book.getIsbn() == null) return false;
    return book.getIsbn().equals(row.isbn13()) || book.getIsbn().equals(row.isbn());
  }

  private boolean titleMatches(Book book, String csvTitle) {
    if (book.getTitle() == null || csvTitle == null) return false;
    String bookTitle = normalize(book.getTitle());
    String searchTitle = normalize(csvTitle);
    // Accept if titles are identical, one contains the other (subtítulo),
    // or the first 4+ words match (livros com subtítulos longos no Goodreads)
    if (bookTitle.equals(searchTitle)) return true;
    if (bookTitle.contains(searchTitle) || searchTitle.contains(bookTitle)) return true;
    return firstWords(bookTitle, 4).equals(firstWords(searchTitle, 4)) && !firstWords(bookTitle, 4).isBlank();
  }

  private String normalize(String s) {
    return s.toLowerCase().replaceAll("[^a-z0-9\\s]", "").strip().replaceAll("\\s+", " ");
  }

  private String firstWords(String s, int n) {
    String[] parts = s.split(" ");
    int limit = Math.min(n, parts.length);
    return String.join(" ", java.util.Arrays.copyOfRange(parts, 0, limit));
  }

  private ReadingStatus mapStatus(String exclusiveShelf) {
    return switch (exclusiveShelf) {
      case "read" -> ReadingStatus.COMPLETED;
      case "currently-reading" -> ReadingStatus.READING;
      case "to-read" -> ReadingStatus.WANT_TO_READ;
      default -> throw new IllegalArgumentException("Exclusive Shelf inválido: " + exclusiveShelf);
    };
  }

  private Shelf findOrCreateImportShelf(Long userId) {
    return shelfUseCase.listShelves(userId).stream()
        .filter(s -> IMPORT_SHELF_NAME.equals(s.getName()))
        .findFirst()
        .orElseGet(() -> shelfUseCase.createShelf(userId, IMPORT_SHELF_NAME, IMPORT_SHELF_DESC));
  }

  private void validateFilename(String filename) {
    if (filename == null || filename.isBlank()) {
      throw new GoodreadsImportException("Nome do arquivo não pode ser vazio.");
    }
    if (filename.length() > MAX_FILENAME_LENGTH) {
      throw new GoodreadsImportException("Nome do arquivo excede o limite permitido.");
    }
    if (filename.contains("..") || filename.contains("/") || filename.contains("\\")) {
      throw new GoodreadsImportException("Nome do arquivo contém caracteres inválidos.");
    }
    String lower = filename.toLowerCase();
    if (!lower.endsWith(".csv") && !lower.endsWith(".txt")) {
      throw new GoodreadsImportException("Extensão inválida. Apenas arquivos .csv são aceitos.");
    }
  }

  private void validateContentType(byte[] sniff, String filename) {
    if (sniff == null || sniff.length == 0) {
      throw new GoodreadsImportException("O arquivo está vazio.");
    }
    String detected;
    try {
      detected = TIKA.detect(sniff, filename);
    } catch (Exception e) {
      throw new GoodreadsImportException("Não foi possível verificar o tipo do arquivo.");
    }
    boolean isText =
        detected != null
            && (detected.startsWith("text/") || ALLOWED_MEDIA_TYPES.contains(detected));
    if (!isText) {
      throw new GoodreadsImportException(
          "Tipo de arquivo inválido: '"
              + detected
              + "'. Apenas arquivos CSV (text/plain ou text/csv) são aceitos.");
    }
  }

  private String firstIsbn(GoodreadsImportRow row) {
    if (row.isbn13() != null) return row.isbn13();
    if (row.isbn() != null) return row.isbn();
    return "N/A";
  }

  // ── Internal value types ────────────────────────────────────────────────────

  private enum ShelfResult {
    IMPORTED,
    SKIPPED,
    FAILED
  }

  private record RowOutcome(ShelfResult shelfResult, boolean reviewCreated) {
    static RowOutcome failed() {
      return new RowOutcome(ShelfResult.FAILED, false);
    }
  }
}
