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
import java.util.Arrays;
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

  private record CollectionTemplate(String name, String description, int[] shelfIndices) {}

  static final int SHELVES_PER_USER = 7;
  private static final int BOOKS_PER_SHELF = 8;

  // 5 perfis de leitores — cada usuário recebe o perfil userIndex % 5.
  // Ordem fixa dos 7 nomes por perfil determina a estante que o usuário verá.
  static final String[][] SHELF_NAMES_BY_PROFILE = {
    // Perfil 0 — Clássicos & Literatura Geral (marcos, beatriz, thiago, fernanda)
    {
      "Clássicos Lidos",
      "Literatura Brasileira",
      "Literatura Estrangeira",
      "Grandes Obras",
      "Quero Ler",
      "Relendo com Carinho",
      "Em Progresso"
    },
    // Perfil 1 — Fantasia & Ficção Científica (ana, gabriel, larissa, eduardo)
    {
      "Fantasia Épica",
      "Ficção Científica",
      "Space Opera",
      "Distopias Lidas",
      "Mundos Mágicos",
      "Próximas Aventuras",
      "Clássicos do Gênero"
    },
    // Perfil 2 — Suspense & Terror (felipe, isabela, bruno, natalia)
    {
      "Thrillers Devorados",
      "Mistério e Crime",
      "Horror e Terror",
      "Suspense Psicológico",
      "Fila de Espera",
      "Favoritos Absolutos",
      "Decepções"
    },
    // Perfil 3 — Literatura Diversa & Regional (julia, rafael, amanda, gustavo)
    {
      "Realismo Mágico",
      "Literatura Latino-Americana",
      "Lidos e Aprovados",
      "Quero Ler Urgente",
      "Recs de Amigos",
      "Releituras",
      "Em Pausa"
    },
    // Perfil 4 — Contemporâneo & YA (lucas, camila, diego, priscila)
    {
      "YA e Jovem Adulto",
      "Romance Contemporâneo",
      "Que Me Fez Chorar",
      "Lendo Agora",
      "Quero Ler",
      "Bom Demais",
      "Decepções"
    }
  };

  // Padrões de status por perfil × posição de estante (7 estantes × 8 livros cada).
  private static final ReadingStatus[][][] PROFILE_STATUS_PATTERNS = {
    // Perfil 0 — Clássicos
    {
      {ReadingStatus.COMPLETED, ReadingStatus.WANT_TO_READ, ReadingStatus.COMPLETED, ReadingStatus.READING, ReadingStatus.COMPLETED, ReadingStatus.ABANDONED, ReadingStatus.COMPLETED, ReadingStatus.WANT_TO_READ},
      {ReadingStatus.COMPLETED, ReadingStatus.COMPLETED, ReadingStatus.READING, ReadingStatus.WANT_TO_READ, ReadingStatus.COMPLETED, ReadingStatus.ABANDONED, ReadingStatus.COMPLETED, ReadingStatus.READING},
      {ReadingStatus.COMPLETED, ReadingStatus.READING, ReadingStatus.COMPLETED, ReadingStatus.WANT_TO_READ, ReadingStatus.ABANDONED, ReadingStatus.COMPLETED, ReadingStatus.READING, ReadingStatus.COMPLETED},
      {ReadingStatus.WANT_TO_READ, ReadingStatus.COMPLETED, ReadingStatus.READING, ReadingStatus.COMPLETED, ReadingStatus.WANT_TO_READ, ReadingStatus.COMPLETED, ReadingStatus.ABANDONED, ReadingStatus.COMPLETED},
      {ReadingStatus.WANT_TO_READ, ReadingStatus.WANT_TO_READ, ReadingStatus.WANT_TO_READ, ReadingStatus.WANT_TO_READ, ReadingStatus.WANT_TO_READ, ReadingStatus.WANT_TO_READ, ReadingStatus.WANT_TO_READ, ReadingStatus.WANT_TO_READ},
      {ReadingStatus.COMPLETED, ReadingStatus.READING, ReadingStatus.COMPLETED, ReadingStatus.READING, ReadingStatus.COMPLETED, ReadingStatus.READING, ReadingStatus.COMPLETED, ReadingStatus.READING},
      {ReadingStatus.READING, ReadingStatus.WANT_TO_READ, ReadingStatus.READING, ReadingStatus.WANT_TO_READ, ReadingStatus.READING, ReadingStatus.WANT_TO_READ, ReadingStatus.READING, ReadingStatus.WANT_TO_READ}
    },
    // Perfil 1 — Fantasia & FC
    {
      {ReadingStatus.COMPLETED, ReadingStatus.COMPLETED, ReadingStatus.WANT_TO_READ, ReadingStatus.COMPLETED, ReadingStatus.READING, ReadingStatus.ABANDONED, ReadingStatus.COMPLETED, ReadingStatus.WANT_TO_READ},
      {ReadingStatus.COMPLETED, ReadingStatus.READING, ReadingStatus.COMPLETED, ReadingStatus.WANT_TO_READ, ReadingStatus.ABANDONED, ReadingStatus.COMPLETED, ReadingStatus.READING, ReadingStatus.COMPLETED},
      {ReadingStatus.COMPLETED, ReadingStatus.WANT_TO_READ, ReadingStatus.COMPLETED, ReadingStatus.READING, ReadingStatus.COMPLETED, ReadingStatus.ABANDONED, ReadingStatus.WANT_TO_READ, ReadingStatus.COMPLETED},
      {ReadingStatus.COMPLETED, ReadingStatus.COMPLETED, ReadingStatus.COMPLETED, ReadingStatus.READING, ReadingStatus.WANT_TO_READ, ReadingStatus.COMPLETED, ReadingStatus.READING, ReadingStatus.ABANDONED},
      {ReadingStatus.READING, ReadingStatus.WANT_TO_READ, ReadingStatus.COMPLETED, ReadingStatus.WANT_TO_READ, ReadingStatus.READING, ReadingStatus.ABANDONED, ReadingStatus.WANT_TO_READ, ReadingStatus.READING},
      {ReadingStatus.WANT_TO_READ, ReadingStatus.WANT_TO_READ, ReadingStatus.WANT_TO_READ, ReadingStatus.WANT_TO_READ, ReadingStatus.WANT_TO_READ, ReadingStatus.WANT_TO_READ, ReadingStatus.WANT_TO_READ, ReadingStatus.WANT_TO_READ},
      {ReadingStatus.COMPLETED, ReadingStatus.READING, ReadingStatus.COMPLETED, ReadingStatus.WANT_TO_READ, ReadingStatus.COMPLETED, ReadingStatus.ABANDONED, ReadingStatus.COMPLETED, ReadingStatus.READING}
    },
    // Perfil 2 — Suspense & Terror
    {
      {ReadingStatus.COMPLETED, ReadingStatus.COMPLETED, ReadingStatus.READING, ReadingStatus.WANT_TO_READ, ReadingStatus.COMPLETED, ReadingStatus.ABANDONED, ReadingStatus.COMPLETED, ReadingStatus.READING},
      {ReadingStatus.COMPLETED, ReadingStatus.READING, ReadingStatus.COMPLETED, ReadingStatus.COMPLETED, ReadingStatus.WANT_TO_READ, ReadingStatus.ABANDONED, ReadingStatus.COMPLETED, ReadingStatus.READING},
      {ReadingStatus.READING, ReadingStatus.COMPLETED, ReadingStatus.WANT_TO_READ, ReadingStatus.COMPLETED, ReadingStatus.ABANDONED, ReadingStatus.COMPLETED, ReadingStatus.READING, ReadingStatus.WANT_TO_READ},
      {ReadingStatus.COMPLETED, ReadingStatus.COMPLETED, ReadingStatus.COMPLETED, ReadingStatus.READING, ReadingStatus.WANT_TO_READ, ReadingStatus.COMPLETED, ReadingStatus.READING, ReadingStatus.ABANDONED},
      {ReadingStatus.WANT_TO_READ, ReadingStatus.WANT_TO_READ, ReadingStatus.WANT_TO_READ, ReadingStatus.WANT_TO_READ, ReadingStatus.WANT_TO_READ, ReadingStatus.WANT_TO_READ, ReadingStatus.WANT_TO_READ, ReadingStatus.WANT_TO_READ},
      {ReadingStatus.COMPLETED, ReadingStatus.COMPLETED, ReadingStatus.COMPLETED, ReadingStatus.COMPLETED, ReadingStatus.READING, ReadingStatus.COMPLETED, ReadingStatus.COMPLETED, ReadingStatus.READING},
      {ReadingStatus.ABANDONED, ReadingStatus.READING, ReadingStatus.ABANDONED, ReadingStatus.WANT_TO_READ, ReadingStatus.ABANDONED, ReadingStatus.READING, ReadingStatus.ABANDONED, ReadingStatus.WANT_TO_READ}
    },
    // Perfil 3 — Literatura Diversa
    {
      {ReadingStatus.COMPLETED, ReadingStatus.READING, ReadingStatus.COMPLETED, ReadingStatus.WANT_TO_READ, ReadingStatus.ABANDONED, ReadingStatus.COMPLETED, ReadingStatus.READING, ReadingStatus.COMPLETED},
      {ReadingStatus.COMPLETED, ReadingStatus.COMPLETED, ReadingStatus.READING, ReadingStatus.WANT_TO_READ, ReadingStatus.COMPLETED, ReadingStatus.ABANDONED, ReadingStatus.COMPLETED, ReadingStatus.READING},
      {ReadingStatus.COMPLETED, ReadingStatus.COMPLETED, ReadingStatus.COMPLETED, ReadingStatus.READING, ReadingStatus.COMPLETED, ReadingStatus.WANT_TO_READ, ReadingStatus.COMPLETED, ReadingStatus.ABANDONED},
      {ReadingStatus.WANT_TO_READ, ReadingStatus.WANT_TO_READ, ReadingStatus.WANT_TO_READ, ReadingStatus.READING, ReadingStatus.WANT_TO_READ, ReadingStatus.WANT_TO_READ, ReadingStatus.WANT_TO_READ, ReadingStatus.READING},
      {ReadingStatus.READING, ReadingStatus.WANT_TO_READ, ReadingStatus.COMPLETED, ReadingStatus.WANT_TO_READ, ReadingStatus.READING, ReadingStatus.ABANDONED, ReadingStatus.WANT_TO_READ, ReadingStatus.COMPLETED},
      {ReadingStatus.COMPLETED, ReadingStatus.READING, ReadingStatus.COMPLETED, ReadingStatus.READING, ReadingStatus.COMPLETED, ReadingStatus.READING, ReadingStatus.COMPLETED, ReadingStatus.READING},
      {ReadingStatus.ABANDONED, ReadingStatus.READING, ReadingStatus.ABANDONED, ReadingStatus.WANT_TO_READ, ReadingStatus.ABANDONED, ReadingStatus.READING, ReadingStatus.WANT_TO_READ, ReadingStatus.ABANDONED}
    },
    // Perfil 4 — Contemporâneo & YA
    {
      {ReadingStatus.COMPLETED, ReadingStatus.WANT_TO_READ, ReadingStatus.COMPLETED, ReadingStatus.READING, ReadingStatus.COMPLETED, ReadingStatus.ABANDONED, ReadingStatus.COMPLETED, ReadingStatus.WANT_TO_READ},
      {ReadingStatus.COMPLETED, ReadingStatus.READING, ReadingStatus.COMPLETED, ReadingStatus.WANT_TO_READ, ReadingStatus.ABANDONED, ReadingStatus.COMPLETED, ReadingStatus.READING, ReadingStatus.COMPLETED},
      {ReadingStatus.COMPLETED, ReadingStatus.COMPLETED, ReadingStatus.COMPLETED, ReadingStatus.COMPLETED, ReadingStatus.READING, ReadingStatus.COMPLETED, ReadingStatus.WANT_TO_READ, ReadingStatus.COMPLETED},
      {ReadingStatus.READING, ReadingStatus.READING, ReadingStatus.READING, ReadingStatus.WANT_TO_READ, ReadingStatus.READING, ReadingStatus.READING, ReadingStatus.WANT_TO_READ, ReadingStatus.READING},
      {ReadingStatus.WANT_TO_READ, ReadingStatus.WANT_TO_READ, ReadingStatus.WANT_TO_READ, ReadingStatus.WANT_TO_READ, ReadingStatus.WANT_TO_READ, ReadingStatus.WANT_TO_READ, ReadingStatus.WANT_TO_READ, ReadingStatus.WANT_TO_READ},
      {ReadingStatus.COMPLETED, ReadingStatus.COMPLETED, ReadingStatus.READING, ReadingStatus.COMPLETED, ReadingStatus.WANT_TO_READ, ReadingStatus.COMPLETED, ReadingStatus.READING, ReadingStatus.COMPLETED},
      {ReadingStatus.ABANDONED, ReadingStatus.WANT_TO_READ, ReadingStatus.ABANDONED, ReadingStatus.READING, ReadingStatus.ABANDONED, ReadingStatus.WANT_TO_READ, ReadingStatus.READING, ReadingStatus.ABANDONED}
    }
  };

  // Coleções temáticas por perfil. shelfIndices referencia as posições em SHELF_NAMES_BY_PROFILE.
  private static final List<List<CollectionTemplate>> PROFILE_COLLECTIONS =
      List.of(
          // Perfil 0 — Clássicos
          List.of(
              new CollectionTemplate(
                  "Cânone Pessoal",
                  "As obras que definiram meu gosto literário e minha forma de ver o mundo",
                  new int[] {0, 1, 2}),
              new CollectionTemplate(
                  "Literatura que Forma",
                  "Leituras essenciais para entender a condição humana e a história",
                  new int[] {1, 3}),
              new CollectionTemplate(
                  "Descobertas Clássicas",
                  "Obras que me surpreenderam e ampliaram meu olhar literário",
                  new int[] {2, 4, 6})),
          // Perfil 1 — Fantasia & FC
          List.of(
              new CollectionTemplate(
                  "Universos Alternativos",
                  "Os melhores mundos que já visitei em papel — fantasia, FC e tudo entre eles",
                  new int[] {0, 1, 3}),
              new CollectionTemplate(
                  "FC e Fantasia Essenciais",
                  "O que não pode faltar em nenhuma boa estante de especulativa",
                  new int[] {0, 1, 6}),
              new CollectionTemplate(
                  "Próximas Galáxias",
                  "Aventuras e mundos que ainda me aguardam",
                  new int[] {4, 5})),
          // Perfil 2 — Suspense & Terror
          List.of(
              new CollectionTemplate(
                  "O Crime Compensa",
                  "Mistérios e thrillers que me prenderam da primeira à última página",
                  new int[] {0, 1}),
              new CollectionTemplate(
                  "Mestres do Suspense",
                  "Os melhores do gênero, sem discussão — King, Christie e companhia",
                  new int[] {0, 1, 3}),
              new CollectionTemplate(
                  "Noites Sem Dormir",
                  "Livros que garantidamente tiram o sono e assombram a imaginação",
                  new int[] {2, 5})),
          // Perfil 3 — Literatura Diversa
          List.of(
              new CollectionTemplate(
                  "Vozes da América Latina",
                  "Literatura que representa nossa identidade e conta nossas histórias",
                  new int[] {0, 1}),
              new CollectionTemplate(
                  "Realismo e Magia",
                  "Onde o impossível coexiste com o cotidiano de forma absolutamente natural",
                  new int[] {0, 2}),
              new CollectionTemplate(
                  "Leituras que Transformam",
                  "Obras que mudaram minha perspectiva de vida e de literatura",
                  new int[] {1, 2, 5})),
          // Perfil 4 — Contemporâneo & YA
          List.of(
              new CollectionTemplate(
                  "Livros que Me Formaram",
                  "O que li que me fez tornar quem sou — de YA a contemporâneo adulto",
                  new int[] {0, 1}),
              new CollectionTemplate(
                  "Eu Chorei, Eu Juro",
                  "Obras com poder emocional devastador — lenço obrigatório",
                  new int[] {0, 2}),
              new CollectionTemplate(
                  "Da Rec ao Amor",
                  "Indicações de amigos que viraram obsessões absolutas",
                  new int[] {3, 5})));

  public void populateLibraries(List<User> users, List<Long> bookIds) {
    if (!users.isEmpty()) {
      try {
        if (shelfUseCase.listShelves(users.get(0).getId()).size() >= SHELVES_PER_USER) {
          return;
        }
      } catch (Exception ignored) {
      }
    }

    for (int ui = 0; ui < users.size(); ui++) {
      User user = users.get(ui);
      try {
        List<Shelf> shelves = ensureShelves(user.getId(), ui);
        populateShelfItems(user.getId(), shelves, bookIds, ui);
        ensureCollections(user.getId(), shelves, ui);
        populateReadingActiveDays(user.getId(), shelves, ui);
      } catch (Exception e) {
        log.warn("[Seed-Library] Falha para '{}': {}", user.getUsername(), e.getMessage());
      }
    }
  }

  private List<Shelf> ensureShelves(Long userId, int userIndex) {
    int profileIdx = userIndex % SHELF_NAMES_BY_PROFILE.length;
    String[] profileNames = SHELF_NAMES_BY_PROFILE[profileIdx];

    List<Shelf> existing = shelfUseCase.listShelves(userId);
    Set<String> existingNames = existing.stream().map(Shelf::getName).collect(Collectors.toSet());

    for (String name : profileNames) {
      if (existingNames.contains(name)) continue;
      try {
        existing.add(shelfUseCase.createShelf(userId, name, null));
        existingNames.add(name);
      } catch (Exception e) {
        log.warn(
            "[Seed-Library] Estante '{}' ignorada (userId={}): {}", name, userId, e.getMessage());
      }
    }

    return Arrays.stream(profileNames)
        .map(name -> existing.stream().filter(s -> s.getName().equals(name)).findFirst())
        .filter(Optional::isPresent)
        .map(Optional::get)
        .collect(Collectors.toList());
  }

  private void populateShelfItems(
      Long userId, List<Shelf> shelves, List<Long> bookIds, int userIndex) {
    int profileIdx = userIndex % PROFILE_STATUS_PATTERNS.length;
    ReadingStatus[][] patterns = PROFILE_STATUS_PATTERNS[profileIdx];
    int totalBooks = bookIds.size();

    for (int si = 0; si < shelves.size(); si++) {
      Shelf shelf = shelves.get(si);
      ReadingStatus[] pattern = patterns[si % patterns.length];

      Set<Long> usedInShelf =
          shelfUseCase.listShelfItems(userId, shelf.getId()).stream()
              .map(ShelfItem::getBookId)
              .collect(Collectors.toCollection(HashSet::new));

      for (int bi = 0; bi < BOOKS_PER_SHELF; bi++) {
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

  private void ensureCollections(Long userId, List<Shelf> shelves, int userIndex) {
    int profileIdx = userIndex % PROFILE_COLLECTIONS.size();
    List<CollectionTemplate> templates = PROFILE_COLLECTIONS.get(profileIdx);

    Set<String> existingNames =
        collectionUseCase.listCollections(userId).stream()
            .map(Collection::getName)
            .collect(Collectors.toSet());

    for (int ti = 0; ti < templates.size(); ti++) {
      if (ti == 2 && userIndex % 3 != 0) continue;
      CollectionTemplate tmpl = templates.get(ti);
      if (existingNames.contains(tmpl.name())) continue;

      List<Long> shelfIds =
          Arrays.stream(tmpl.shelfIndices())
              .filter(idx -> idx < shelves.size())
              .mapToObj(idx -> shelves.get(idx).getId())
              .collect(Collectors.toList());

      try {
        collectionUseCase.createCollection(userId, tmpl.name(), tmpl.description(), shelfIds);
        existingNames.add(tmpl.name());
      } catch (Exception e) {
        log.warn(
            "[Seed-Library] Coleção '{}' ignorada (userId={}): {}", tmpl.name(), userId, e.getMessage());
      }
    }
  }

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
}
