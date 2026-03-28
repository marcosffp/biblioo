package com.biblioo.books.domain.service;

import com.biblioo.books.domain.model.Book;
import com.biblioo.books.infrasestructure.external.GoogleBooksAdapter;
import com.biblioo.books.infrasestructure.persistence.BookRepository;
import com.biblioo.books.infrasestructure.search.OpenSearchBookAdapter;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Responsável por buscar livros no Google Books, persistir os novos no banco e indexá-los no
 * OpenSearch.
 *
 * <p>Separado de BookService para que @Async funcione corretamente: Spring AOP não intercepta
 * chamadas feitas dentro da mesma classe (self-invocation), então o método assíncrono precisa estar
 * em um bean diferente.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BookEnrichService {

  private final BookRepository repository;
  private final OpenSearchBookAdapter search;
  private final GoogleBooksAdapter external;

  /**
   * Versão síncrona: usada quando o OpenSearch está vazio e o usuário precisa de uma resposta
   * imediata.
   */
  public List<Book> enrichSync(String query) {
    var externalBooks = external.search(query);
    if (externalBooks.isEmpty()) return List.of();
    persistNewBooks(externalBooks);
    return externalBooks;
  }

  /**
   * Versão assíncrona: enriquece o índice em background para que a próxima busca com o mesmo termo
   * já encontre resultados locais.
   */
  @Async("bookEnrichExecutor")
  public CompletableFuture<Void> enrichAsync(String query) {
    try {
      var externalBooks = external.search(query);
      persistNewBooks(externalBooks);
    } catch (Exception e) {
      log.debug(
          "Enriquecimento assíncrono falhou para query='{}'. Causa: {}", query, e.getMessage());
    }
    return CompletableFuture.completedFuture(null);
  }

  /**
   * Filtra livros que ainda não existem no banco (por ISBN) e os salva. @Transactional garante que
   * o findExistingIsbns e o saveAll ocorram na mesma unidade de trabalho, reduzindo janelas de race
   * condition. A constraint UNIQUE de isbn no banco é a última linha de defesa contra inserções
   * duplicadas concorrentes.
   */
  @Transactional
  public void persistNewBooks(List<Book> books) {
    var newBooks = filterExisting(books);
    if (newBooks.isEmpty()) return;
    var saved = repository.saveAll(newBooks);
    search.indexAll(saved);
  }

  private List<Book> filterExisting(List<Book> books) {
    var isbns = books.stream().map(Book::getIsbn).filter(Objects::nonNull).toList();

    if (isbns.isEmpty()) return List.of();

    // findExistingIsbns retorna Set<String>: contains() é O(1).
    // Renomeado de findAllByIsbn para deixar a intenção explícita no callsite.
    Set<String> existing = repository.findExistingIsbns(isbns);

    return books.stream()
        .filter(b -> b.getIsbn() != null)
        .filter(b -> !existing.contains(b.getIsbn()))
        .toList();
  }
}