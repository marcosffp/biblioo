package com.biblioo.infrastructure.config.seed;

import com.biblioo.books.domain.port.in.BookUseCase;
import com.biblioo.books.infrasestructure.dto.book.BookSearchResult;
import com.biblioo.books.infrasestructure.persistence.BookRepository;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class BookSeedService {

  private final BookUseCase bookUseCase;
  private final BookRepository bookRepository;

  static final List<String> BOOK_QUERIES =
      List.of(
          "O Senhor dos Anéis Tolkien",
          "Harry Potter Pedra Filosofal",
          "As Crônicas de Nárnia Lewis",
          "O Hobbit Tolkien",
          "Eragon Paolini",
          "Duna Frank Herbert",
          "Extraordinário R.J. Palacio",
          "O Caçador de Pipas Hosseini",
          "Fundação Asimov",
          "Ready Player One Jogador",
          "O Conto da Aia Atwood",
          "Eu Robô Asimov",
          "Orgulho e Preconceito Austen",
          "1984 George Orwell",
          "É Assim que Acaba Colleen Hoover",
          "Admirável Mundo Novo Huxley",
          "A Culpa é das Estrelas John Green",
          "E Não Sobrou Nenhum Agatha Christie",
          "Assassinato no Expresso do Oriente Christie",
          "Garota Exemplar Flynn",
          "Fahrenheit 451 Bradbury",
          "O Código Da Vinci Brown",
          "Frankenstein Mary Shelley",
          "A Paciente Silenciosa Michaelides",
          "Drácula Bram Stoker",
          "Caixa de Pássaros Josh Malerman",
          "O Iluminado Stephen King",
          "Dom Casmurro Machado de Assis",
          "It A Coisa Stephen King",
          "Torto Arado Itamar Vieira",
          "Ilha do Medo Dennis Lehane",
          "Vinte Mil Léguas Submarinas Verne",
          "As Aventuras de Tom Sawyer Twain",
          "Capitães da Areia Jorge Amado",
          "Vidas Secas Graciliano Ramos",
          "O Cortiço Aluísio Azevedo",
          "Iracema José de Alencar");

  public List<Long> fetchBooks() {
    long existingCount = bookRepository.count();
    if (existingCount >= BOOK_QUERIES.size() / 2) {
      log.info(
          "[Seed-Books] {} livros já no banco. Carregando IDs sem chamar API externa.",
          existingCount);
      return bookRepository.findAllIds();
    }

    Set<Long> ids = new LinkedHashSet<>();
    for (String query : BOOK_QUERIES) {
      try {
        List<BookSearchResult> results = bookUseCase.search(query);
        results.stream()
            .limit(2)
            .map(BookSearchResult::getId)
            .filter(Objects::nonNull)
            .forEach(ids::add);
      } catch (Exception e) {
        log.warn("[Seed-Books] Falha ao buscar '{}': {}", query, e.getMessage());
      }
    }
    return new ArrayList<>(ids);
  }
}
