package com.biblioo.feed.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@SuperBuilder
@Entity
@Table(
    name = "comments",
    indexes = {
      @Index(name = "idx_comment_parent_id", columnList = "parent_id"),
      @Index(name = "idx_comment_parent_created", columnList = "parent_id")
    })
@PrimaryKeyJoinColumn(name = "id")
public class Comment extends Content {

  @Column(name = "parent_id", nullable = false)
  private Long parentId;
}
