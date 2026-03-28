package com.biblioo.books.domain.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(name = "shelf_items", uniqueConstraints = {
        // Garante que o mesmo livro não seja adicionado duas vezes na mesma estante.
        @UniqueConstraint(name = "uk_shelf_book", columnNames = { "shelf_id", "book_id" })
}, indexes = {
        @Index(name = "idx_item_shelf_id", columnList = "shelf_id"),
        @Index(name = "idx_item_book_id", columnList = "book_id"),
        @Index(name = "idx_item_status", columnList = "status"),
        @Index(name = "idx_item_shelf_status", columnList = "shelf_id, status"), // composto — cobre filtros por estante
                                                                                 // + status
        @Index(name = "idx_item_deleted_at", columnList = "deleted_at")
})
@SQLRestriction("deleted_at IS NULL") // soft delete transparente: queries JPA nunca enxergam itens deletados
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShelfItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Identificador único do item da estante no banco de dados.

    @Column(name = "shelf_id", nullable = false)
    private Long shelfId; // Identificador da estante à qual este item pertence.

    @Column(name = "book_id", nullable = false)
    private Long bookId; // Identificador do livro associado a este item.

    @Enumerated(EnumType.STRING) // STRING obrigatório — ORDINAL quebra se a ordem do enum mudar.
    @Column(nullable = false)
    private ReadingStatus status; // Status atual de leitura do livro.

    @Column(name = "current_page")
    private Integer currentPage; // Última página lida registrada pelo usuário.

    @Column(name = "total_pages")
    private Integer totalPages; // Snapshot do pageCount do livro no momento da adição — imutável após criação.


    @Column(name = "progress_percent")
    private Integer progressPercent; // Progresso percentual derivado (0–100). Somente leitura para a aplicação.

    @Column(name = "rating")
    private Integer rating; // Avaliação (1–5) dada pelo usuário. Só válida quando status = COMPLETED.

    @Column(name = "review_text", columnDefinition = "TEXT")
    private String reviewText; // Resenha textual do usuário. Só válida quando status = COMPLETED.

    @Column(name = "started_at")
    private LocalDate startedAt; // Data em que a leitura foi iniciada. Obrigatória nos status READING,
                                 // REREADING, COMPLETED.

    @Column(name = "finished_at")
    private LocalDate finishedAt; // Data em que a leitura foi concluída. Obrigatória apenas em COMPLETED.

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt; // Soft delete. Registro permanece para histórico do DNA Literário.

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt; // Data e hora em que o item foi criado.

    @Column(name = "updated_at")
    private LocalDateTime updatedAt; // Data e hora da última atualização do item.

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = this.createdAt;

        // Garante currentPage zerado na criação quando status não implica leitura em
        // andamento.
        if (this.currentPage == null) {
            this.currentPage = 0;
        }

        // startedAt preenchido na criação quando já nasce em READING ou REREADING.
        if ((this.status == ReadingStatus.READING || this.status == ReadingStatus.REREADING)
                && this.startedAt == null) {
            this.startedAt = LocalDate.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        if ((this.status == ReadingStatus.READING || this.status == ReadingStatus.REREADING)
                && this.startedAt == null) {
            this.startedAt = LocalDate.now();
        }
    }
}