package com.biblioo.infrastructure.config.seed;

import com.biblioo.books.domain.model.Collection;
import com.biblioo.books.domain.model.ReadingStatus;
import com.biblioo.books.domain.model.Shelf;
import com.biblioo.books.domain.model.ShelfItem;
import com.biblioo.books.domain.port.in.CollectionUseCase;
import com.biblioo.books.domain.port.in.ShelfUseCase;
import com.biblioo.books.infrasestructure.persistence.ReadingActiveDayRepository;
import com.biblioo.user.domain.model.User;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class LibrarySeedService {

  private final ShelfUseCase shelfUseCase;
  private final CollectionUseCase collectionUseCase;
  private final ReadingActiveDayRepository readingActiveDayRepository;

  static final List<String> SHELF_NAMES =
      List.of(
          "Fantasia e Aventura",
          "Clássicos da Literatura",
          "Ficção Científica",
          "Suspense e Mistério",
          "Romance e Drama",
          "Literatura Brasileira",
          "Próximas Leituras");

  private static final ReadingStatus[][] SHELF_STATUS_PATTERNS = {
    {
      ReadingStatus.COMPLETED,
      ReadingStatus.WANT_TO_READ,
      ReadingStatus.READING,
      ReadingStatus.COMPLETED,
      ReadingStatus.ABANDONED,
      ReadingStatus.WANT_TO_READ
    },
    {
      ReadingStatus.COMPLETED,
      ReadingStatus.COMPLETED,
      ReadingStatus.READING,
      ReadingStatus.WANT_TO_READ,
      ReadingStatus.COMPLETED,
      ReadingStatus.ABANDONED
    },
    {
      ReadingStatus.READING,
      ReadingStatus.WANT_TO_READ,
      ReadingStatus.COMPLETED,
      ReadingStatus.WANT_TO_READ,
      ReadingStatus.ABANDONED,
      ReadingStatus.COMPLETED
    },
    {
      ReadingStatus.WANT_TO_READ,
      ReadingStatus.WANT_TO_READ,
      ReadingStatus.WANT_TO_READ,
      ReadingStatus.READING,
      ReadingStatus.WANT_TO_READ,
      ReadingStatus.WANT_TO_READ
    },
    {
      ReadingStatus.COMPLETED,
      ReadingStatus.ABANDONED,
      ReadingStatus.COMPLETED,
      ReadingStatus.READING,
      ReadingStatus.COMPLETED,
      ReadingStatus.WANT_TO_READ
    },
    {
      ReadingStatus.ABANDONED,
      ReadingStatus.WANT_TO_READ,
      ReadingStatus.COMPLETED,
      ReadingStatus.READING,
      ReadingStatus.WANT_TO_READ,
      ReadingStatus.COMPLETED
    },
    {
      ReadingStatus.WANT_TO_READ,
      ReadingStatus.WANT_TO_READ,
      ReadingStatus.WANT_TO_READ,
      ReadingStatus.WANT_TO_READ,
      ReadingStatus.WANT_TO_READ,
      ReadingStatus.WANT_TO_READ
    }
  };

  public void populateLibraries(List<User> users, List<Long> bookIds) {
    if (!users.isEmpty()) {
      try {
        if (shelfUseCase.listShelves(users.get(0).getId()).size() >= SHELF_NAMES.size()) {
          return;
        }
      } catch (Exception ignored) {
      }
    }

    for (int ui = 0; ui < users.size(); ui++) {
      User user = users.get(ui);
      try {
        List<Shelf> shelves = ensureShelves(user.getId());
        populateShelfItems(user.getId(), shelves, bookIds, ui);
        ensureCollections(user.getId(), shelves, ui);
        populateReadingActiveDays(user.getId(), shelves, ui);
      } catch (Exception e) {
        log.warn("[Seed-Library] Falha para '{}': {}", user.getUsername(), e.getMessage());
      }
    }
  }

  private List<Shelf> ensureShelves(Long userId) {
    List<Shelf> existing = shelfUseCase.listShelves(userId);
    Set<String> existingNames = existing.stream().map(Shelf::getName).collect(Collectors.toSet());

    for (String name : SHELF_NAMES) {
      if (existingNames.contains(name)) continue;
      try {
        existing.add(shelfUseCase.createShelf(userId, name, null));
        existingNames.add(name);
      } catch (Exception e) {
        log.warn(
            "[Seed-Library] Estante '{}' ignorada (userId={}): {}", name, userId, e.getMessage());
      }
    }

    return SHELF_NAMES.stream()
        .map(name -> existing.stream().filter(s -> s.getName().equals(name)).findFirst())
        .filter(Optional::isPresent)
        .map(Optional::get)
        .toList();
  }

  private void populateShelfItems(
      Long userId, List<Shelf> shelves, List<Long> bookIds, int userIndex) {
    int totalBooks = bookIds.size();

    for (int si = 0; si < shelves.size(); si++) {
      Shelf shelf = shelves.get(si);
      ReadingStatus[] pattern = SHELF_STATUS_PATTERNS[si % SHELF_STATUS_PATTERNS.length];

      Set<Long> usedInShelf =
          shelfUseCase.listShelfItems(userId, shelf.getId()).stream()
              .map(ShelfItem::getBookId)
              .collect(Collectors.toCollection(HashSet::new));

      for (int bi = 0; bi < 6; bi++) {
        int bookIdx = ((userIndex * 13 + si * 7 + bi) % totalBooks + totalBooks) % totalBooks;
        Long bookId = bookIds.get(bookIdx);

        int attempts = 0;
        while (usedInShelf.contains(bookId) && attempts < totalBooks) {
          bookIdx = (bookIdx + 1) % totalBooks;
          bookId = bookIds.get(bookIdx);
          attempts++;
        }
        if (usedInShelf.contains(bookId)) continue;

        usedInShelf.add(bookId);
        ReadingStatus status = pattern[bi % pattern.length];
        try {
          shelfUseCase.addShelfItem(userId, shelf.getId(), bookId, status);
        } catch (Exception e) {
          log.warn(
              "[Seed-Library] Item ignorado (shelfId={}, bookId={}): {}",
              shelf.getId(),
              bookId,
              e.getMessage());
        }
      }
    }
  }

  /**
   * Popula os dias ativos de leitura ({@code reading_active_days}) simulando um histórico/streak por
   * usuário. O número de dias varia por usuário para gerar diversidade de streaks. Insere datas
   * passadas diretamente no repositório (o use case {@code updateItemProgress} só registra o dia
   * atual). {@code insertOrIgnore} é idempotente (unique por usuário+livro+data).
   */
  private void populateReadingActiveDays(Long userId, List<Shelf> shelves, int userIndex) {
    List<Long> books = new ArrayList<>();
    for (Shelf shelf : shelves) {
      shelfUseCase.listShelfItems(userId, shelf.getId()).stream()
          .filter(
              item ->
                  item.getStatus() == ReadingStatus.READING
                      || item.getStatus() == ReadingStatus.COMPLETED)
          .map(ShelfItem::getBookId)
          .forEach(books::add);
    }
    if (books.isEmpty()) return;

    // Streak atual de tamanho variável (5..24 dias consecutivos até hoje).
    int activeDays = 5 + (userIndex % 20);
    LocalDate today = LocalDate.now();
    for (int d = 0; d < activeDays; d++) {
      Long bookId = books.get(d % books.size());
      try {
        readingActiveDayRepository.insertOrIgnore(userId, bookId, today.minusDays(d));
      } catch (Exception e) {
        log.warn(
            "[Seed-Library] Dia ativo ignorado (userId={}, bookId={}): {}",
            userId,
            bookId,
            e.getMessage());
      }
    }
  }

  private void ensureCollections(Long userId, List<Shelf> shelves, int userIndex) {
    Set<String> existingNames =
        collectionUseCase.listCollections(userId).stream()
            .map(Collection::getName)
            .collect(Collectors.toSet());

    int shelfCount = shelves.size();
    if (shelfCount < 2) return;

    int mid = shelfCount / 2;

    createCollectionIfAbsent(
        userId,
        "Minha Biblioteca",
        "Minha coleção principal de leituras",
        shelves.subList(0, Math.min(mid + 1, shelfCount)),
        existingNames);

    createCollectionIfAbsent(
        userId,
        "Leituras Favoritas",
        "Os livros que mais me marcaram",
        shelves.subList(Math.max(0, mid - 1), shelfCount),
        existingNames);

    if (userIndex % 3 == 0) {
      createCollectionIfAbsent(
          userId,
          "Descobertas Recentes",
          "Novas adições à minha lista",
          shelves.subList(1, Math.min(shelfCount, mid + 2)),
          existingNames);
    }
  }

  private void createCollectionIfAbsent(
      Long userId,
      String name,
      String description,
      List<Shelf> shelves,
      Set<String> existingNames) {
    if (existingNames.contains(name)) return;
    List<Long> shelfIds = shelves.stream().map(Shelf::getId).collect(Collectors.toList());
    try {
      collectionUseCase.createCollection(userId, name, description, shelfIds);
      existingNames.add(name);
    } catch (Exception e) {
      log.warn(
          "[Seed-Library] Coleção '{}' ignorada (userId={}): {}", name, userId, e.getMessage());
    }
  }
}
