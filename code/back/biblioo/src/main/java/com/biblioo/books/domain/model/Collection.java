package com.biblioo.books.domain.model;

import tools.jackson.databind.annotation.JsonDeserialize;
import tools.jackson.databind.annotation.JsonSerialize;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.hibernate.Hibernate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(
    name = "shelf_collections",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_user_collection_name", columnNames = {"user_id", "name"})
    },
    indexes = {
        @Index(name = "idx_collection_user_id",    columnList = "user_id"),
        @Index(name = "idx_collection_updated_at", columnList = "updated_at")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Collection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Identificador único da coleção no banco de dados.

    @Column(name = "user_id", nullable = false)
    private Long userId; // Identificador do usuário dono da coleção.

    @Column(nullable = false, length = 100)
    private String name; // Nome personalizado da coleção.

    @Column(length = 500)
    private String description; // Descrição opcional da coleção.


    @JsonSerialize(as = ArrayList.class)
    @JsonDeserialize(as = ArrayList.class)
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "collection_shelves",
        joinColumns = @JoinColumn(name = "collection_id"),
        inverseJoinColumns = @JoinColumn(name = "shelf_id")
    )
    @Builder.Default
    private List<Shelf> shelves = new ArrayList<>(); // Estantes vinculadas. Carregamento sempre explícito (LAZY).

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt; // Data e hora em que a coleção foi criada.

    @Column(name = "updated_at")
    private LocalDateTime updatedAt; // Data e hora da última atualização da coleção.

    @PostLoad
    protected void onLoad() {
        if (shelves != null && Hibernate.isInitialized(shelves)) {
            this.shelves = new ArrayList<>(shelves);
        }
    }

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