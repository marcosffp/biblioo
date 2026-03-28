package com.biblioo.books.domain.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import tools.jackson.databind.annotation.JsonDeserialize;
import tools.jackson.databind.annotation.JsonSerialize;

@Entity
@Table(
    name = "books",
    indexes = {
      @Index(name = "idx_isbn", columnList = "isbn"),
      @Index(name = "idx_title", columnList = "title"),
      @Index(name = "idx_published_at", columnList = "published_at"),
      @Index(name = "idx_language", columnList = "language"),
      @Index(name = "idx_rating", columnList = "average_rating"),
      @Index(name = "idx_created_at", columnList = "created_at")
    })
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Book {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id; // Identificador único do livro no banco de dados.

  @Column(nullable = false, length = 20, unique = true)
  private String isbn; // Código único internacional que identifica o livro.

  @Column(nullable = false, length = 500)
  private String title; // Título do livro.

  @ElementCollection(fetch = FetchType.EAGER)
  @CollectionTable(name = "book_authors", joinColumns = @JoinColumn(name = "book_id"))
  @Column(name = "author")
  @JsonSerialize(as = ArrayList.class)
  @JsonDeserialize(as = ArrayList.class)
  private List<String> authors; // Lista de autores do livro.

  @Column(length = 300)
  private String publisher; // Nome da editora que publicou o livro.

  @Column(name = "published_at")
  private LocalDate publishedAt; // Data de publicação do livro.

  @Lob
  @Basic(fetch = FetchType.LAZY)
  private String description; // Descrição detalhada ou sinopse do livro.

  @Column(name = "cover_url", length = 1000)
  private String coverUrl; // URL da imagem da capa do livro.

  private Integer pageCount; // Número de páginas do livro.

  private Float averageRating; // Média das avaliações recebidas pelo livro.

  private Integer ratingCount; // Número total de avaliações recebidas.

  private Integer readerCount; // Número de leitores que marcaram o livro como lido.

  @Column(length = 10)
  private String language; // Idioma do livro (código de idioma, como "en" ou "pt").

  @Column(nullable = false, length = 20)
  private String source; // Origem ou fonte do livro (ex.: "Google Books").

  @JsonIgnore
  @ManyToMany(fetch = FetchType.LAZY)
  @JoinTable(
      name = "book_categories",
      joinColumns = @JoinColumn(name = "book_id"),
      inverseJoinColumns = @JoinColumn(name = "category_id"))
  private List<Category> categories; // Lista de categorias ou gêneros associados ao livro.

  @Column(columnDefinition = "TEXT")
  private String
      searchText; // Texto otimizado para buscas rápidas, contendo informações relevantes do

  // livro.

  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt; // Data e hora em que o registro do livro foi criado.

  @PostLoad
  protected void onLoad() {
    if (authors != null) {
      this.authors = new ArrayList<>(authors);
    }
  }

  @PrePersist
  protected void onCreate() {
    this.createdAt = LocalDateTime.now();
    this.searchText = buildSearchText();
  }

  private String buildSearchText() {
    return String.join(
            " ",
            title != null ? title : "",
            authors != null ? String.join(" ", authors) : "",
            publisher != null ? publisher : "")
        .toLowerCase();
  }
}
