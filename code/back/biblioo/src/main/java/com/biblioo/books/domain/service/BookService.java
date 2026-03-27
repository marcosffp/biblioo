package com.biblioo.books.domain.service;

import com.biblioo.books.domain.exception.BookNotFoundException;
import com.biblioo.books.domain.model.Book;
import com.biblioo.books.domain.port.in.BookUseCase;
import com.biblioo.books.infrasestructure.persistence.BookRepository;
import com.biblioo.books.infrasestructure.search.OpenSearchBookAdapter;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class BookService implements BookUseCase {

  private final BookRepository repository;
  private final OpenSearchBookAdapter search;
  private final BookEnrichService enrichService;

  /**
   * Estratégia de busca em quatro camadas: 1. OpenSearch com resultados → retorna direto (caminho
   * ideal) 2. OpenSearch vazio, DB tem dados → retorna DB e enriquece em background 3. OpenSearch
   * vazio, DB vazio → busca no Google Books de forma síncrona 4. OpenSearch com poucos resultados →
   * retorna o que tem e enriquece em background
   *
   * <p>O fallback para DB evita chamadas lentas à API externa quando o OpenSearch está
   * temporariamente indisponível mas o banco já tem os dados.
   */
  @Override
  @Cacheable(
      value = "book-search",
      key = "#query.strip().toLowerCase()",
      unless = "#result.isEmpty()")
  public List<Book> search(String query) {
    var local = search.search(query);

    if (local.isEmpty()) {
      var db = repository.findByTitleContainingIgnoreCase(query);
      if (!db.isEmpty()) {
        if (db.size() < 3) {
          enrichService.enrichAsync(query);
        }
        return db;
      }
      return enrichService.enrichSync(query);
    }

    if (local.size() < 3) {
      enrichService.enrichAsync(query);
    }

    return local;
  }

  /**
   * Autocomplete com fallback em duas camadas: 1. OpenSearch → resultado mais rápido e relevante 2.
   * DB (LIKE no título) → usado quando OpenSearch está fora
   *
   * <p>Resultados vazios não são cacheados (unless) para que a busca seja retentada quando
   * OpenSearch voltar.
   */
  @Override
  @Cacheable(
      value = "book-suggest",
      key = "#query.strip().toLowerCase()",
      unless = "#result.isEmpty()")
  public List<Book> suggest(String query) {
    var results = search.suggest(query);
    if (results.isEmpty()) {
      return repository.findByTitleContainingIgnoreCaseOrderByTitleAsc(query).stream()
          .limit(8)
          .toList();
    }
    return results;
  }

  @Override
  @Transactional(readOnly = true)
  public Book getById(Long id) {
    return repository.findById(id).orElseThrow(() -> new BookNotFoundException(id));
  }
}
