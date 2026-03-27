package com.biblioo.books.domain.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(
    name = "categories",
    indexes = {
      @Index(name = "idx_name", columnList = "name"),
      @Index(name = "idx_created_at", columnList = "created_at")
    })
public class Category {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id; // Identificador único da categoria no banco de dados.

  @Column(nullable = false, unique = true, length = 100)
  private String name; // Nome único da categoria.

  @ManyToMany(mappedBy = "categories", fetch = FetchType.LAZY)
  private List<Book> books; // Lista de livros associados a esta categoria.

  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt; // Data e hora em que o registro do livro foi criado.

  @PrePersist
  protected void onCreate() {
    this.createdAt = LocalDateTime.now();
  }
}
