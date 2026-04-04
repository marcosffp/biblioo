package com.biblioo.feed.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@SuperBuilder
@MappedSuperclass
public abstract class FeedContent extends Content {

  // Número de comentários associados a este conteúdo
  @Column(name = "comment_count", nullable = false)
  @lombok.Builder.Default
  private Integer commentCount = 0;
}
