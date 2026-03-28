package com.biblioo.books.domain.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(
    name = "shelves",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_user_shelf_name", columnNames = {"user_id", "name"})
    },
    indexes = {
        @Index(name = "idx_shelf_user_id",      columnList = "user_id"),
        @Index(name = "idx_shelf_deleted_at",   columnList = "deleted_at"),
        @Index(name = "idx_shelf_user_deleted", columnList = "user_id, deleted_at") // composto — cobre toda listagem por usuário
    }
)
@SQLRestriction("deleted_at IS NULL")// soft delete transparente: queries JPA nunca enxergam estantes deletadas
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Shelf {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Identificador único da estante no banco de dados.

    @Column(name = "user_id", nullable = false)
    private Long userId; // Identificador do usuário dono da estante.

    @Column(nullable = false, length = 100)
    private String name; // Nome personalizado da estante.

    @Column(length = 500)
    private String description; // Descrição opcional da estante.

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt; // Data e hora em que a estante foi criada.

    @Column(name = "updated_at")
    private LocalDateTime updatedAt; // Data e hora da última atualização da estante.

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt; // Data e hora da exclusão lógica (soft delete).

    // -------------------------------------------------------------------------
    // NÃO há @OneToMany para ShelfItem aqui intencionalmente.
    // O cascade de soft delete dos itens é feito via UPDATE em massa no service:
    //   UPDATE shelf_items SET deleted_at = NOW() WHERE shelf_id = :id AND deleted_at IS NULL
    // Isso preserva o histórico para o DNA Literário e o módulo de Recomendação.
    // -------------------------------------------------------------------------

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = this.createdAt;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}