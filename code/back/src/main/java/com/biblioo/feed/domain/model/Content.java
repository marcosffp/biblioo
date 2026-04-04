package com.biblioo.feed.domain.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Data
@NoArgsConstructor
@SuperBuilder
@MappedSuperclass
public abstract class Content {
  // ID único do conteúdo
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  // ID do usuário que criou o conteúdo
  @Column(name = "user_id", nullable = false)
  private Long userId;

  // Texto do conteúdo (limite de 2000 caracteres)
  @Column(length = 2000, nullable = false)
  private String text;

  // Lista de URLs das imagens associadas ao conteúdo
  @ElementCollection(fetch = FetchType.EAGER)
  @CollectionTable(name = "content_images", joinColumns = @JoinColumn(name = "content_id"))
  @Column(name = "image_url")
  @Builder.Default
  private List<String> images = new ArrayList<>();

  // URL de um GIF associado ao conteúdo
  @Column(name = "gif_url")
  private String gifUrl;

  // Lista de tags associadas ao conteúdo
  @ElementCollection(fetch = FetchType.EAGER)
  @CollectionTable(name = "content_tags", joinColumns = @JoinColumn(name = "content_id"))
  @Column(name = "tag")
  @Builder.Default
  private List<String> tags = new ArrayList<>();

  // Indica se o conteúdo contém spoilers
  @Column(name = "has_spoiler", nullable = false)
  @Builder.Default
  private Boolean hasSpoiler = false;

  // Indica se o conteúdo foi excluído logicamente
  @Column(name = "is_deleted", nullable = false)
  @Builder.Default
  private Boolean isDeleted = false;

  // Contador de curtidas do conteúdo
  @Column(name = "like_count", nullable = false)
  @Builder.Default
  private Integer likeCount = 0;

  // Data de criação do conteúdo
  @CreationTimestamp
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  // Data da última atualização do conteúdo
  @UpdateTimestamp
  @Column(name = "updated_at")
  private LocalDateTime updatedAt;
}
