package com.biblioo.feed.domain.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(
    name = "likes",
    indexes = {
      @Index(name = "idx_like_content_id", columnList = "content_id"),
      @Index(name = "idx_like_user_id", columnList = "user_id"),
      @Index(name = "idx_like_content_user", columnList = "content_id, user_id", unique = true)
    })
public class Like {
  // ID único do like
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  // ID do conteúdo ao qual o like está associado
  @Column(name = "content_id", nullable = false)
  private Long contentId;

  // ID do usuário que deu o like
  @Column(name = "user_id", nullable = false)
  private Long userId;

  // Tipo do like (LIKE ou DISLIKE)
  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private LikeType type;

  // Data de criação do like
  @CreationTimestamp
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;
}
